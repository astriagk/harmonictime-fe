import { ViewportScroller } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  CREATE_SHIPMENT,
  SELLER_ORDER_APPROVAL,
  TRACK_SHIPMENT,
  UPDATE_SHIPMENT,
} from '@config/index';
import { Store } from '@ngrx/store';
import { GenericService } from '@shared/services/generic.service';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ProductService } from 'src/app/shared/services/product.service';
import { loadSellerOrders, upsertSellerOrder } from 'src/app/store/actions/seller-orders.actions';
import {
  selectSellerOrders,
  selectSellerOrdersLoading,
} from 'src/app/store/selectors/seller-orders.selectors';
import { selectUserData } from 'src/app/store/selectors/user.selectors';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss'],
})
export class OrdersComponent implements OnInit, OnDestroy {
  public orders: any[] = [];
  paginationOrders: any = [];

  public paginate: any = {};
  public pageSize = 10;
  public pageNo: number = 1;
  public userData: any = {};
  public loading = true;

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

  public expandedOrderId: string | null = null;
  public isRejectionModalOpen = false;
  public rejectionOrder: any = null;
  public rejectionReason = '';
  public rejectionReasonError = '';
  public isSubmittingApproval = false;
  public isTrackingModalOpen = false;
  public selectedOrder: any = null;
  public courier = '';
  public trackingId = '';
  public trackingUrl = '';
  public shipmentStatus = 'Shipped';
  public trackingError = '';
  public isSavingTracking = false;
  public editingShipmentId: string | null = null;
  // The status the modal was opened with. The carrier (via the TrackingMore
  // webhook) owns this field, so an edit only sends it when the seller has
  // deliberately picked a different value — otherwise a courier/URL correction
  // would PUT a stale cached status back over a carrier-advanced one.
  private originalShipmentStatus = '';
  private originalTrackingNumber = '';
  public readonly shipmentStatuses = [
    { value: 'Pending', label: 'Pending' },
    { value: 'Shipped', label: 'Shipped' },
    { value: 'InTransit', label: 'In Transit' },
    { value: 'OutForDelivery', label: 'Out for Delivery' },
    { value: 'Delivered', label: 'Delivered' },
  ];

  // The carrier-set values are camel-case (`InTransit`, `OutForDelivery`), so
  // anything shown to a seller goes through this rather than rendering raw.
  statusLabel(value: string | null | undefined): string {
    if (!value) return '—';
    return this.shipmentStatuses.find((s) => s.value === value)?.label ?? value;
  }

  private destroy$ = new Subject<void>();

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
    this.store.select(selectUserData).pipe(takeUntil(this.destroy$)).subscribe((state) => {
      this.userData = state?.user?.data;
    });

    this.store.dispatch(loadSellerOrders());

    this.store
      .select(selectSellerOrdersLoading)
      .pipe(takeUntil(this.destroy$))
      .subscribe((loading) => (this.loading = loading));

    this.store
      .select(selectSellerOrders)
      .pipe(takeUntil(this.destroy$))
      .subscribe((orders) => {
        this.orders = orders;
        this.refreshPagination(Number(+this.pageNo));
      });

    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      this.pageNo = params['page'] ? params['page'] : this.pageNo;
      this.refreshPagination(Number(+this.pageNo));
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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
      .finally(() => this.viewScroller.setOffset([120, 120]));
  }

  isShipped(order: any): boolean {
    return !!order?.Shipment || order?.DeliveryStatus === 'Shipped';
  }

  addTracking(order: any) {
    this.selectedOrder = order;
    const shipment = order?.Shipment;
    this.editingShipmentId = shipment?._id ?? null;
    this.courier = shipment?.Courier ?? '';
    this.trackingId = shipment?.TrackingNumber ?? '';
    this.trackingUrl = shipment?.TrackingURL ?? '';
    this.shipmentStatus = shipment?.ShipmentStatus ?? 'Shipped';
    this.originalShipmentStatus = this.shipmentStatus;
    this.originalTrackingNumber = this.trackingId;
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
    this.originalShipmentStatus = '';
    this.originalTrackingNumber = '';
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
        this.store.dispatch(
          upsertSellerOrder({
            order: { ...order, SellerApprovalStatus: 'Approved' },
          }),
        );
        this.toastrService.success('Order approved successfully.');
      },
      error: () => this.toastrService.error('Failed to approve order.'),
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
    if (this.rejectionReason.trim()) payload.Reason = this.rejectionReason.trim();
    const url = SELLER_ORDER_APPROVAL(this.userData._id, this.rejectionOrder._id);
    this.genericService.putObservable(url, payload).subscribe({
      next: () => {
        this.store.dispatch(
          upsertSellerOrder({
            order: {
              ...this.rejectionOrder,
              SellerApprovalStatus: 'Rejected',
              SellerRejectionReason: payload.Reason ?? null,
            },
          }),
        );
        this.toastrService.success('Order rejected.');
        this.closeRejectionModal();
      },
      error: () => {
        this.toastrService.error('Failed to reject order.');
        this.isSubmittingApproval = false;
      },
    });
  }

  // POST/PUT /shipments store the AWB but never register it with TrackingMore —
  // registration only happens inside fetchTracking, which GET /:id/track calls.
  // Without this a shipment receives no webhook pushes until the nightly cron
  // picks it up, up to 24h later. Fire-and-forget: this is a side effect of
  // saving, so a failure must not surface as a "failed to save tracking" error.
  private registerWithCarrier(shipmentId: string | null | undefined): void {
    if (!shipmentId) return;
    this.genericService
      .getObservable(TRACK_SHIPMENT(shipmentId))
      .subscribe({ next: () => {}, error: () => {} });
  }

  saveTracking() {
    const courier = this.courier.trim();
    const trackingNumber = this.trackingId.trim();
    if (!courier || !trackingNumber) {
      this.trackingError = 'Courier and tracking ID are required.';
      return;
    }
    const trackingUrl = this.trackingUrl.trim();
    // Snapshot before the request — closeTracking() clears these, and the
    // response callback runs after the modal may already have been reset.
    const shipmentId = this.editingShipmentId;
    const originalTrackingNumber = this.originalTrackingNumber.trim();
    this.isSavingTracking = true;

    if (shipmentId) {
      const isStatusOverride = this.shipmentStatus !== this.originalShipmentStatus;
      const payload: any = {
        Courier: courier,
        TrackingNumber: trackingNumber,
        TrackingURL: trackingUrl,
      };
      // PUT /shipments/:id is a manual override and bypasses the webhook's
      // STATUS_ORDER regression guard, so only send the field when overriding.
      if (isStatusOverride) payload.ShipmentStatus = this.shipmentStatus;
      this.genericService
        .putObservable(`${UPDATE_SHIPMENT}${shipmentId}`, payload)
        .subscribe({
          next: () => {
            if (this.selectedOrder) {
              this.store.dispatch(
                upsertSellerOrder({
                  order: {
                    ...this.selectedOrder,
                    DeliveryStatus: isStatusOverride
                      ? this.shipmentStatus
                      : this.selectedOrder.DeliveryStatus,
                    Shipment: {
                      ...(this.selectedOrder.Shipment ?? {}),
                      _id: shipmentId,
                      Courier: courier,
                      TrackingNumber: trackingNumber,
                      TrackingURL: trackingUrl,
                      ShipmentStatus: this.shipmentStatus,
                    },
                  },
                }),
              );
            }
            // A corrected AWB is as unregistered as a brand-new one, so
            // re-register it rather than waiting for the nightly cron.
            if (trackingNumber !== originalTrackingNumber) {
              this.registerWithCarrier(shipmentId);
            }
            this.toastrService.success('Tracking details updated successfully.');
            this.closeTracking();
          },
          error: () => {
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
    if (trackingUrl) payload.TrackingURL = trackingUrl;

    this.genericService.postObservable(CREATE_SHIPMENT, payload).subscribe({
      next: (response) => {
        const newShipmentId = response?.data?._id;
        this.registerWithCarrier(newShipmentId);
        if (this.selectedOrder) {
          this.store.dispatch(
            upsertSellerOrder({
              order: {
                ...this.selectedOrder,
                DeliveryStatus: this.shipmentStatus,
                Shipment: {
                  _id: newShipmentId,
                  Courier: courier,
                  TrackingNumber: trackingNumber,
                  TrackingURL: trackingUrl,
                  ShipmentStatus: this.shipmentStatus,
                },
              },
            }),
          );
        }
        this.toastrService.success('Tracking ID added successfully.');
        this.closeTracking();
      },
      error: () => {
        this.toastrService.error('Failed to add tracking ID.');
        this.isSavingTracking = false;
      },
    });
  }
}
