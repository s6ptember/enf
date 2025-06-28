from django.db import models
from django.contrib.sessions.models import Session
from main.models import Product, ProductSize
from decimal import Decimal


class Cart(models.Model):
    session_key = models.CharField(max_length=40, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


    def __str__(self):
        return f"Cart {self.session_key}"
    

    @property
    def total_items(self):
        return sum(item.quantity for item in self.items.all())
    
    
    @property
    def subtotal(self):
        return sum(item.total_price for item in self.items.all())
    

    def add_product(self, product, product_size, quantity=1):
        cart_item, created = CartItem.objects.get_or_create(
            cart=self,
            product=product,
            product_size=product_size,
            defaults={'quantity': quantity}
        )

        if not created:
            cart_item.quantity += quantity
            cart_item.save()

        return cart_item
    

    def remove_item(self, item_id):
        try:
            item = self.items.get(id=item_id)
            item.delete()
            return True
        except CartItem.DoesNotExist:
            return False
        
    
    def update_item_quantity(self, item_id, quantity):
        try:
            item = self.items.get(id=item_id)
            if quantity > 0:
                item.quantity = quantity
                item.sav()
            else:
                item.delete()
            return True
        except CartItem.DoesNotExist:
            return False
        
    
    def clear(self):
        self.items.all().delete()


class CartItem(models.Model):
    cart = models.ForeignKey(Cart, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    product_size = models.ForeignKey(ProductSize, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    added_at = models.DateTimeField(auto_now_add=True)


    class Meta:
        unique_together = ('cart', 'product', 'product_size')

    
    def __str__(self):
        return f"{self.product.name} - {self.product_size.size.name} x {self.quantity}"
    

    @property
    def total_price(self):
        return Decimal(str(self.product.price)) * self.quantity