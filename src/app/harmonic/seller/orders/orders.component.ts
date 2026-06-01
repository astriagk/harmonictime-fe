import { ViewportScroller } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  CREATE_SHIPMENT,
  GET_SELLER_ORDERS,
  SELLER_ORDER_APPROVAL,
  UPDATE_SHIPMENT,
} from '@config/index';
import { Store } from '@ngrx/store';
import { GenericService } from '@shared/services/generic.service';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs';
import { ProductService } from 'src/app/shared/services/product.service';
import { selectUserData } from 'src/app/store/selectors/user.selectors';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss'],
})
export class OrdersComponent {
  public orders: any[] = [];
  paginationOrders: any = [];

  public paginate: any = {}; // Pagination use only
  public pageSize = 10;
  public pageNo: number = 1;
  public userData: any = {};
  public loading = true; // Show skeleton until the first orders response

  public approvalFilter: 'All' | 'Pending' | 'Approved' | 'Rejected' = 'All';
  public readonly approvalFilters: { label: string; value: 'All' | 'Pending' | 'Approved' | 'Rejected' }[] = [
    { label: 'All', value: 'All' },
    { label: 'Pending', value: 'Pending' },
    { label: 'Approved', value: 'Approved' },
    { label: 'Rejected', value: 'Rejected' },
  ];

  get filteredOrders(): any[] {
    if (this.approvalFilter === 'All') return this.orders;
    return this.orders.filter((o) => o.SellerApprovalStatus === this.approvalFilter);
  }

  // Expandable detail rows
  public expandedOrderId: string | null = null;

  // Approval state
  public isRejectionModalOpen = false;
  public rejectionOrder: any = null;
  public rejectionReason = '';
  public rejectionReasonError = '';
  public isSubmittingApproval = false;

  // Tracking-ID modal state
  public isTrackingModalOpen = false;
  public selectedOrder: any = null;
  public courier = '';
  public trackingId = '';
  public trackingUrl = '';
  public shipmentStatus = 'Shipped';
  public trackingError = '';
  public isSavingTracking = false;
  // Set when the selected order already has a shipment, so the modal edits
  // (PUT) the existing record instead of creating a new one.
  public editingShipmentId: string | null = null;
  // Allowed by the backend (updateShipmentSchema). `value` is sent as-is;
  // `label` is the human-readable text shown in the dropdown.
  public readonly shipmentStatuses = [
    { value: 'Pending', label: 'Pending' },
    { value: 'Shipped', label: 'Shipped' },
    { value: 'InTransit', label: 'In Transit' },
    { value: 'OutForDelivery', label: 'Out for Delivery' },
    { value: 'Delivered', label: 'Delivered' },
  ];

  constructor(
    public productService: ProductService,
    private router: Router,
    private route: ActivatedRoute,
    private viewScroller: ViewportScroller,
    private store: Store,
    private genericService: GenericService,
    private toastrService: ToastrService
  ) {}

  ngOnInit(): void {
    this.store.select(selectUserData).subscribe((state) => {
      this.userData = state?.user?.data;

      if (this.userData?._id) {
        // Returns every order containing at least one product this seller
        // listed, with only this seller's line items per order, newest first.
        const url = `${GET_SELLER_ORDERS}${this.userData._id}`;
        this.genericService
          .getObservable(url)
          .pipe(finalize(() => (this.loading = false)))
          .subscribe((response) => {
            this.orders = response?.data || [];
            this.refreshPagination(Number(+this.pageNo));
          });
      } else if (state) {
        // Store has emitted but there's no logged-in seller — stop the skeleton.
        this.loading = false;
      }
    });

    this.route.queryParams.subscribe((params) => {
      this.pageNo = params['page'] ? params['page'] : this.pageNo;
      this.refreshPagination(Number(+this.pageNo));
    });
  }

  setApprovalFilter(value: 'All' | 'Pending' | 'Approved' | 'Rejected'): void {
    this.approvalFilter = value;
    this.refreshPagination(1);
  }

  private refreshPagination(pageNo: number = this.pageNo): void {
    this.paginate = this.productService.getPager(
      this.filteredOrders.length,
      pageNo,
      this.pageSize,
    );
    this.paginationOrders = this.filteredOrders.slice(
      this.paginate.startIndex,
      this.paginate.endIndex + 1,
    );
  }

  setPage(page: number) {
    this.router
      .navigate([], {
        relativeTo: this.route,
        queryParams: { page: page },
        queryParamsHandling: 'merge',
        skipLocationChange: false,
      })
      .finally(() => {
        this.viewScroller.setOffset([120, 120]);
      });
  }

  // True once the order has been shipped (a shipment exists for it). Used to
  // switch the row action between "Add" and "Edit".
  isShipped(order: any): boolean {
    return !!order?.Shipment || order?.DeliveryStatus === 'Shipped';
  }

  addTracking(order: any) {
    this.selectedOrder = order;
    const shipment = order?.Shipment;
    // Pre-fill from the existing shipment so the seller edits instead of re-adds.
    this.editingShipmentId = shipment?._id ?? null;
    this.courier = shipment?.Courier ?? '';
    this.trackingId = shipment?.TrackingNumber ?? '';
    this.trackingUrl = shipment?.TrackingURL ?? '';
    this.shipmentStatus = shipment?.ShipmentStatus ?? 'Shipped';
    this.trackingError = '';
    this.isTrackingModalOpen = true;
  }

  closeTracking() {
    this.isTrackingModalOpen = false;
    this.selectedOrder = null;
    this.editingShipmentId = null;
    this.courier = '';
    this.trackingId = '';
    this.trackingUrl = '';
    this.shipmentStatus = 'Shipped';
    this.trackingError = '';
    this.isSavingTracking = false;
  }

  toggleExpand(orderId: string) {
    this.expandedOrderId = this.expandedOrderId === orderId ? null : orderId;
  }

  approveOrder(order: any) {
    const url = SELLER_ORDER_APPROVAL(this.userData._id, order._id);
    this.genericService.putObservable(url, { Status: 'Approved' }).subscribe({
      next: () => {
        order.SellerApprovalStatus = 'Approved';
        this.toastrService.success('Order approved successfully.');
      },
      error: () => {
        this.toastrService.error('Failed to approve order.');
      },
    });
  }

  openRejectionModal(order: any) {
    this.rejectionOrder = order;
    this.rejectionReason = '';
    this.rejectionReasonError = '';
    this.isRejectionModalOpen = true;
  }

  closeRejectionModal() {
    this.isRejectionModalOpen = false;
    this.rejectionOrder = null;
    this.rejectionReason = '';
    this.rejectionReasonError = '';
    this.isSubmittingApproval = false;
  }

  submitRejection() {
    if (this.rejectionReason.length > 500) {
      this.rejectionReasonError = 'Reason must be 500 characters or fewer.';
      return;
    }
    this.isSubmittingApproval = true;
    const payload: any = { Status: 'Rejected' };
    if (this.rejectionReason.trim()) {
      payload.Reason = this.rejectionReason.trim();
    }
    const url = SELLER_ORDER_APPROVAL(this.userData._id, this.rejectionOrder._id);
    this.genericService.putObservable(url, payload).subscribe({
      next: () => {
        this.rejectionOrder.SellerApprovalStatus = 'Rejected';
        this.rejectionOrder.SellerRejectionReason = payload.Reason ?? null;
        this.toastrService.success('Order rejected.');
        this.closeRejectionModal();
      },
      error: () => {
        this.toastrService.error('Failed to reject order.');
        this.isSubmittingApproval = false;
      },
    });
  }

  saveTracking() {
    const courier = this.courier.trim();
    const trackingNumber = this.trackingId.trim();
    if (!courier || !trackingNumber) {
      this.trackingError = 'Courier and tracking ID are required.';
      return;
    }

    const trackingUrl = this.trackingUrl.trim();
    this.isSavingTracking = true;

    if (this.editingShipmentId) {
      // Editing an existing shipment — PUT the known fields. Changing
      // ShipmentStatus also re-syncs the order's DeliveryStatus on the backend.
      const payload: any = {
        Courier: courier,
        TrackingNumber: trackingNumber,
        ShipmentStatus: this.shipmentStatus,
        TrackingURL: trackingUrl,
      };
      this.genericService
        .putObservable(`${UPDATE_SHIPMENT}${this.editingShipmentId}`, payload)
        .subscribe({
          next: () => {
            if (this.selectedOrder) {
              this.selectedOrder.DeliveryStatus = this.shipmentStatus;
              this.selectedOrder.Shipment = {
                ...(this.selectedOrder.Shipment ?? {}),
                _id: this.editingShipmentId,
                Courier: courier,
                TrackingNumber: trackingNumber,
                TrackingURL: trackingUrl,
                ShipmentStatus: this.shipmentStatus,
              };
            }
            this.toastrService.success('Tracking details updated successfully.');
            this.closeTracking();
          },
          error: (error) => {
            console.error('Error updating shipment:', error);
            this.toastrService.error('Failed to update tracking details.');
            this.isSavingTracking = false;
          },
        });
      return;
    }

    const payload: any = {
      CheckoutID: this.selectedOrder?._id,
      SellerID: this.userData?._id,
      Courier: courier,
      TrackingNumber: trackingNumber,
      ShipmentStatus: this.shipmentStatus,
    };
    if (trackingUrl) {
      payload.TrackingURL = trackingUrl;
    }

    this.genericService.postObservable(CREATE_SHIPMENT, payload).subscribe({
      next: (response) => {
        // Backend syncs the order's DeliveryStatus to the shipment status;
        // reflect it locally so the seller sees the change immediately.
        if (this.selectedOrder) {
          this.selectedOrder.DeliveryStatus = this.shipmentStatus;
          this.selectedOrder.Shipment = {
            _id: response?.data?._id,
            Courier: courier,
            TrackingNumber: trackingNumber,
            TrackingURL: trackingUrl,
            ShipmentStatus: this.shipmentStatus,
          };
        }
        this.toastrService.success('Tracking ID added successfully.');
        this.closeTracking();
      },
      error: (error) => {
        console.error('Error creating shipment:', error);
        this.toastrService.error('Failed to add tracking ID.');
        this.isSavingTracking = false;
      },
    });
  }
}
