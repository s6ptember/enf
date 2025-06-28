from django.contrib import admin
from .models import Cart, CartItem


class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0
    readonly_fields = ('total_price',)


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ('session_key', 'total_items', 'subtotal', 'created_at',
                    'updated_at')
    list_filter = ('created_at', 'updated_at')
    search_fields = ('session_key',)
    inlines = [CartItemInline]
    readonly_fields = ('total_items', 'subtotal')


@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ('cart', 'product', 'product_size',
                    'quantity', 'total_price', 'added_at')
    list_filter = ('added_at',)
    search_fields = ('product__name', 'cart__session_key')
    readonly_fields = ('total_price',)