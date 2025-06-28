from django.urls import path
from . import views

app_name = 'cart'

urlpatterns = [
    path('', views.CartModalView.as_view(), name='cart_modal'),
    path('add/<slug:slug>/', views.AddToCartView.as_view(), name='add_to_cart'),
    path('update/<int:item_id>/', views.UpdateCartItemView.as_view(), name='update_item'),
    path('remove/<int:item_id>/', views.RemoveCartItemView.as_view(), name='remove_item'),
    path('count/', views.CartCountView.as_view(), name='cart_count'),
    path('clear/', views.ClearCartView.as_view(), name='clear_cart'),
    path('summary', views.CartSummaryView.as_view(), name='cart_summary'),
]