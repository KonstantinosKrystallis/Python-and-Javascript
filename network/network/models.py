from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    following = models.ManyToManyField("self",related_name='intrest' ,default="" ,blank=True, null=True, symmetrical=False)
    followed = models.ManyToManyField("self",related_name='followers',default="", blank=True, null=True, symmetrical=False)
    
    def serialize(self):
        return {
            "id": self.id,
            "username": self.username,
            "following": [user.username for user in self.following.all()],
            "followed": [user.username for user in self.followed.all()],
        }

class Post(models.Model):
    poster = models.ForeignKey(User, on_delete=models.CASCADE, related_name='poster', default="")
    timestamp = models.DateTimeField(auto_now=True)
    content = models.TextField()
    liked = models.ManyToManyField(User, related_name='liked', blank=True, symmetrical=False)

    def serialize(self):
        return {
            "id": self.id,
            "poster": self.poster.username,
            "timestamp": self.timestamp.strftime("%b %d %Y, %I:%M %p"),
            "content": self.content,
            "liked": [user.username for user in self.liked.all()],
        }
