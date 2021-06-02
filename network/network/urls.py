
from django.urls import path

from . import views

urlpatterns = [
    path("", views.posts_all, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),

    path("create", views.create_post, name="create_post"),
    path("edit", views.edit_post, name="edit_post"),
    path("all", views.posts_all, name="al"),
    path("all/<int:page>", views.posts_all, name="all"),
    path("following", views.following, name="following"),
    path("following/<int:page>", views.following, name="followin"),
    path("profile", views.profile, name="profile"),
    path("profile/<str:profile>", views.profile, name="profile"),
    path("profile/<str:profile>/<int:page>", views.profile, name="profile"),
]