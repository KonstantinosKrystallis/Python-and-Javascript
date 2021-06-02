from django.urls import path
from . import views

urlpatterns = [
    path("", views.index_view, name="index"),
    path("home", views.index_view, name="index"),
    path("leaderboard", views.leaderboard_view, name="leaderboard"),
    path("profile", views.profile_view, name="profile"),
    path("profile/<str:usr>", views.profile_view, name="profile"),
    path("watchlist", views.watchlist_view, name="watchlist"),
    path("game", views.game_view, name="game"),
    path("search_user", views.search_view, name="search"),


    path("control_panel", views.control_panel, name="control_panel"),


    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register_view, name="register"),
   

]