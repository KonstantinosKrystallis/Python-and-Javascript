# Create your views here.
import json, random, time
from datetime import datetime

from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse

from .models import User, Game
from .utils import CalculateScore, NotZero

# deafault view and game view
def index_view(request):
    if request.method == "GET":
        return render(request, "tictac/index.html")       

def login_view(request):
    if request.user.is_authenticated:
        return render(request, "tictac/index.html", {
                "message": "Already logged in!"
            })
    if request.method == "POST":
        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)
        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "tictac/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "tictac/login.html")

@login_required(login_url='/login')
def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))

def register_view(request):
    if request.user.is_authenticated:
        return render(request, "tictac/index.html", {
                "message": "Already logged in!"
            })
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "tictac/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "tictac/register.html", {
                "message": "Username already taken."
            })

        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "tictac/register.html")

# handles the leaderboard
def leaderboard_view(request):
    if request.method == "GET":
        return render(request, "tictac/leaderboard.html")
    elif request.method == "POST":
        users = User.objects.all()
        users = users.order_by("-score")[:100]  # Sort users from high to low score
        return JsonResponse(
            { 
            'users': [user.serialize() for user in users]
            },
            safe=False)

# handles anything that has to do with users' profiles
@login_required(login_url='/login')
def profile_view(request, usr=""):
    # user requests their own profile
    if usr == "":
        if request.user.is_authenticated:
            if request.method == "GET":
                return render(request, "tictac/profile.html")
            elif request.method == "POST":
                return JsonResponse ({
                "content" : request.user.loadProfile(),
                },
                safe=False)
    # user requests another user's profile
    else:
        if request.method == "GET":
            return render(request, "tictac/profile.html")
        elif request.method == "POST":
            user = User.objects.get(username=usr)
            return JsonResponse ({
            "content": user.loadProfile(),
            "watched": request.user.watch_list.filter(username=usr).exists(), 
            # the above is done in order to let the requester's browser know 
            # if the profile they are visiting is one of the watched ones or not
            },
            safe=False)
        # enables the user to watch or unwatch another user
        elif request.method == "WATCH":
            watcher = request.user #The one who wants to  watch the user
            watched = User.objects.get(username=usr)#The user who gets watched
            if not watcher.watch_list.filter(username=watched).exists():
                watcher.watch_list.add(watched)
                return JsonResponse({"response": 'WATCH'},safe=False);
            else:
                watcher.watch_list.remove(watched)
                return JsonResponse({"response": 'UNWATCH'},safe=False)

@login_required(login_url='/login')
def watchlist_view(request):
    if request.method == "GET":
        return render(request, "tictac/leaderboard.html")
    elif request.method == "POST":
        users = request.user.watch_list.all()
        users = users.order_by("-score").all() # Sort users from high to low score
        return JsonResponse(
            { 
            'users': [user.serialize() for user in users]
            },
            safe=False)

@login_required
def search_view(request):
    if request.method == "GET":
        return render(request, "tictac/search.html")
    elif request.method == "POST":
        users = User.objects.all()
        users = users.order_by("username").all() # Sort users from high to low score
        return JsonResponse(
            { 
            'users': [user.serialize() for user in users]
            },
            safe=False)
    elif request.method == "SEARCH":
        data = json.loads(request.body)
        username = data.get("username", "")
        users = User.objects.filter(username__contains=username)
        users = users.order_by("username").all() # Sort users from high to low score
        return JsonResponse(
            { 
            'users': [user.serialize() for user in users]
            },
            safe=False)

#Handle game completion
def game_view(request):
    #If user is logged in store the result
    if request.method == "POST":
        if request.user.is_authenticated:
            data = json.loads(request.body)
            user = request.user
            timestamp = data.get("timestamp", "")
            hasPlayed = data.get("hasPlayed", "")
            turn = data.get("turn", "")
            won = data.get("won", "")
            done = data.get("done","")
            obj, created = Game.objects.update_or_create(
                player=user,
                timestamp = timestamp,
                defaults={'player': user, 'timestamp': timestamp, 'turn': turn, 'won': won, 'done': done},
            )          
            if done:
                # finalize result
                User.objects.filter(username=user.username).update(score=NotZero(user.score +  CalculateScore(turn,won) + 5))
                return JsonResponse(
                { 
                'complete': True,
                'message': "Game result saved",
                },
                safe=False)
            else:
                # update user's score
                if (hasPlayed and turn == 2):
                    User.objects.filter(username=user.username).update(score=NotZero(user.score - 5)) #This is done is case the user forfeits  
                # update result
                return JsonResponse(
                { 
                'complete': True,
                'message': "Game state updated",
                },
                safe=False)
        else:
            return JsonResponse(
            { 
            'complete': False,
            'message': "You must be logged in, if you wish for your game results to be saved.",
            },
            safe=False)
    else:
        return JsonResponse(
        { 
        'done': False,
        'message': "Invalid request",
        },
        safe=False)

# debug view, only available to admins
@login_required(login_url='/login')
def control_panel(request):
    if request.user.is_superuser:
        if request.method == "GET":
            return render(request, "tictac/control_panel.html")
        elif request.method == "POST":
            return JsonResponse(
            { 
            'message': "Page loaded",
            },
            safe=False)
        # creates 200 users with a random score
        elif request.method == "CREATE":
            exist = 0
            count = 0
            for i in range(120):
                obj, created = User.objects.get_or_create(
                    username=f'TestUser{i+1}',
                    defaults={'username': f'TestUser{i+1}', 'password': f'TestUser{i+1}', 'score': random.randrange(0, 10000)},
                )
                if obj and not created:
                    exist = exist + 1
                elif obj and created:
                    count = count + 1
            return JsonResponse(
            { 
            'message': f"{count} test users created, {exist} already existed",
            },
            safe=False)
        # deletes all test users created
        elif request.method == "DELETE":
            for i in range(120):
                User.objects.filter(username=f'TestUser{i+1}').delete()
            return JsonResponse(
            { 
            'message': "Test users deleted successfully",
            },
            safe=False)
        # creates test games for all test users (their data is random)
        elif request.method == "MAKE":
            exist = 0
            count = 0
            played = [True, False]
            results = ["Won", "Lost", "Tie"]
            data = json.loads(request.body)
            timestamp = data.get("timestamp", "")
            for i in range(120):
                user = User.objects.get(username=f'TestUser{i+1}')
                for j in range(5):
                    turn = random.randrange(2, 9)
                    won = random.choice(results)
                    done = random.choice(played)
                    obj, created = Game.objects.get_or_create(
                        player = None, # This is done to ensure all games are created
                        defaults={'player': user, 'timestamp': timestamp, 'turn': turn, 'won': won, 'done': done},
                    )
                    if obj and not created:
                        exist = exist + 1
                    elif obj and created:
                        count = count + 1
            return JsonResponse(
            { 
            'message': "Test games created successfully",
            },
            safe=False)
        # deletes all created test games
        elif request.method == "UNMAKE":
            for i in range(120):
                user = User.objects.get(username=f'TestUser{i+1}')
                Game.objects.filter(player=user).delete()
            return JsonResponse(
            { 
            'message': "Test games deleted successfully",
            },
            safe=False)
        # returns all existing users
        elif request.method == "USERS":
            users = User.objects.all()
            return JsonResponse(
            { 
            'content': [user.serialize() for user in users],
            },
            safe=False)
        # returns all existing games 
        elif request.method == "GAMES":
            games = Game.objects.all()
            games = games.order_by('-timestamp')
            return JsonResponse(
            { 
            'content': [game.debug_serialize() for game in games],
            },
            safe=False)
        else:
            return JsonResponse(
            { 
            'message': "Invalid request",
            },
            safe=False)
    else:
        return render(request, "tictac/index.html",
            { 
                'message': "Not authorized to access this page.",
            },
        )
            