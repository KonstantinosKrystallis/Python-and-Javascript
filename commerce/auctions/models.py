from django.contrib.auth.models import AbstractUser
from django.db import models
class User(AbstractUser):
    pass

    def __str__(self):
        return f"{self.id}: {self.username}"

class Listing(models.Model):
    name = models.CharField(max_length=128)
    description = models.TextField()
    startingBid = models.DecimalField(max_digits=12,decimal_places=2)
    image = models.TextField(blank=True)
    category = models.CharField(max_length=64, null=True, blank=True)
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name="creator", default="")
    closed = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.id}: {self.name}"


class Bid(models.Model):
    usrId = models.ForeignKey(User, on_delete=models.CASCADE, related_name="bider", default="")
    prodId = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name="prod", default="")
    amount = models.DecimalField(max_digits=12,decimal_places=2, default="")

class Comment(models.Model):
    listing = models.ForeignKey(Listing, on_delete = models.CASCADE, related_name ='comments', default="")
    usrId = models.ForeignKey(User, on_delete=models.CASCADE, related_name="poster", default="")
    date = models.DateTimeField(auto_now=True)
    message = models.TextField()

    def __str__(self):
        return f'{self.id}: {self.usrId.username}\'s comment on {self.listing.name}'

class Watchlist(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="wathcer", default="")
    listing = models.ManyToManyField(Listing, related_name="watched", null=True)