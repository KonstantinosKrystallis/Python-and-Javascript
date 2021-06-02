from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("<str:page>", views.wiki_page, name="page"),
    path("create_page", views.create_page, name="newpage"),
    path("random", views.random_page, name="random"),
    path("search", views.search_page, name="search"),
    path("<str:page>/edit", views.edit_page, name="edit")
]
