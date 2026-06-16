import { createReducer, on } from '@ngrx/store';
import {
  loadProducts,
  loadProductsFailure,
  loadProductsSuccess,
  loadProductDetail,
  loadProductDetailSuccess,
  loadProductDetailFailure,
  loadEditProduct,
  loadEditProductSuccess,
  loadEditProductFailure,
} from '../actions/product.actions';

export interface ProductsState {
  products: any[];
  loaded: boolean;
  loading: boolean;
  error: string | null;
  detailProduct: any | null;
  detailProductId: string | null;
  detailLoading: boolean;
  editProduct: any | null;
  editLoading: boolean;
}

export const initialState: ProductsState = {
  products: [],
  loaded: false,
  loading: false,
  error: null,
  detailProduct: null,
  detailProductId: null,
  detailLoading: false,
  editProduct: null,
  editLoading: false,
};

export const productsReducer = createReducer(
  initialState,

  on(loadProducts, (state) => ({
    ...state,
    loading: !state.loaded,
    error: null,
  })),

  on(loadProductsSuccess, (state, { products }) => ({
    ...state,
    products,
    loaded: true,
    loading: false,
    error: null,
  })),

  on(loadProductsFailure, (state, { error }) => ({
    ...state,
    loaded: false,
    loading: false,
    error,
  })),

  on(loadProductDetail, (state, { id }) => ({
    ...state,
    detailLoading: id !== state.detailProductId,
    detailProduct: id !== state.detailProductId ? null : state.detailProduct,
  })),

  on(loadProductDetailSuccess, (state, { product, id }) => ({
    ...state,
    detailProduct: product,
    detailProductId: id,
    detailLoading: false,
  })),

  on(loadProductDetailFailure, (state) => ({
    ...state,
    detailLoading: false,
  })),

  on(loadEditProduct, (state) => ({
    ...state,
    editLoading: true,
    editProduct: null,
  })),

  on(loadEditProductSuccess, (state, { product }) => ({
    ...state,
    editProduct: product,
    editLoading: false,
  })),

  on(loadEditProductFailure, (state) => ({
    ...state,
    editLoading: false,
  }))
);
