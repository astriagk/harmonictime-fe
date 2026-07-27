import { createReducer, on } from '@ngrx/store';
import {
  loadProducts,
  searchProducts,
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
  // What `products` currently represents: a search term, or null for the full
  // catalog. Drives whether a refetch is needed when toggling search on/off.
  searchQuery: string | null;
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
  searchQuery: null,
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
    // Show loading on first load, or when switching back from search results.
    loading: !state.loaded || state.searchQuery !== null,
    error: null,
  })),

  // Only flag loading when the term actually changes (mirrors the effect's
  // skip-if-same-query guard), so a repeat dispatch can't leave it stuck on.
  on(searchProducts, (state, { query }) => ({
    ...state,
    loading: state.searchQuery !== query,
    error: null,
  })),

  on(loadProductsSuccess, (state, { products, query }) => ({
    ...state,
    products,
    searchQuery: query ?? null,
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
