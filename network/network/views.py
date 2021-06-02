import json
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt
from django.core.paginator import Paginator
from django.core import serializers

from .models import User, Post

POSTS_PER_PAGE = 10

def index(request):
    return render(request, "network/index.html") 


def login_view(request):
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
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })

        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")


@csrf_exempt
@login_required
def create_post(request):
    # Composing a new post must be via POST
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)

    data = json.loads(request.body)
    poster = request.user
    content = data.get("content", "")

    # Create one email for each recipient, plus sender
    post = Post(
        poster=poster,
        content=content,
    )
    post.save()

    return JsonResponse({"message": "Created post successfully."}, status=201)


@csrf_exempt
def edit_post(request):
    if request.method == 'GET':
        postId = request.GET.get('post')
        post = Post.objects.get(id=postId)
        return render(request, "network/edit.html",{
            'content': post.content
        }) 
    elif request.method == 'POST':
        data = json.loads(request.body)
        content = data.get("content", "")
        postId = data.get("id", "")
        Post.objects.filter(id=postId).update(content=content)
        return JsonResponse({"message": "Edited post successfully."}, status=301)

@csrf_exempt
def posts_all(request,page=1):
    if request.method == "GET":
         return render(request, "network/index.html") 

    #Get all posts
    elif request.method == "POST":
        posts = Post.objects.all()
        posts = posts.order_by("-timestamp").all()  # Return posts in chronologial order
        paginator = Paginator(posts, POSTS_PER_PAGE) 
        page_number = page
        page_obj = paginator.get_page(page_number)
        response = JsonResponse(
            { 
            'posts': [post.serialize() for post in page_obj.object_list], 
            'page': page, 
            'end': paginator.num_pages,
            'hasNext': page_obj.has_next(),
            'hasPrevious': page_obj.has_previous(),
            },
            safe=False)
        return response

    #Like/Unlike post
    elif request.method == "LIKE":
        user = request.user
        data = json.loads(request.body)
        post = Post.objects.get(id=data.get("post", ""))
        if not post.liked.filter(username=user.username).exists():
            print(f'Post liked :{post}')
            post.liked.add(user)
            posts = Post.objects.all()
            posts = posts.order_by("-timestamp").all()  # Return posts in chronologial order
            paginator = Paginator(posts, POSTS_PER_PAGE)
            page_number = page
            page_obj = paginator.get_page(page_number)
            response = JsonResponse(
            { 
            'posts': [post.serialize() for post in page_obj.object_list], 
            'page': page, 
            'end': paginator.num_pages,
            'hasNext': page_obj.has_next(),
            'hasPrevious': page_obj.has_previous(),
            },
             safe=False)
            return response

        else:
            print(f'Post unliked :{post}')
            post.liked.remove(user)
            posts = Post.objects.all()
            posts = posts.order_by("-timestamp").all()  # Return posts in chronologial order
            paginator = Paginator(posts, POSTS_PER_PAGE)
            page_number = page
            page_obj = paginator.get_page(page_number)
            response = JsonResponse(
            { 
            'posts': [post.serialize() for post in page_obj.object_list], 
            'page': page, 
            'end': paginator.num_pages,
            'hasNext': page_obj.has_next(),
            'hasPrevious': page_obj.has_previous(),
            },
             safe=False)
            return response


@csrf_exempt
def profile(request, profile='you', page=1):
    if profile == 'you':
        profile = request.user.username
    if request.method == "GET":
        return render(request, "network/profile.html")

    #Get all post from specific user
    elif request.method == "POST":
        print(f'profile: {profile} , page: {page}')
        user = User.objects.get(username=profile)
        if user:
            posts = Post.objects.filter(poster=user)
        else:
            return JsonResponse({"message": "User not found."}, status=404)
        posts = posts.order_by("-timestamp").all()  # Return posts in chronologial order
        paginator = Paginator(posts, POSTS_PER_PAGE) 
        page_obj = paginator.get_page(page)
        response = JsonResponse(
            { 
            'posts': [post.serialize() for post in page_obj.object_list], 
            'page': page, 
            'end': paginator.num_pages,
            'hasNext': page_obj.has_next(),
            'hasPrevious': page_obj.has_previous(),
            },
             safe=False)
        return response

    #Follow/Unfollow request
    elif request.method == "FOLLOW":
        follower = request.user #The one who wants to  follow the user
        followed = User.objects.get(username=profile)#The user who gets followed
        if not follower.following.filter(username=followed).exists():
            print(f'following {profile}')
            follower.following.add(followed)
            followed.followed.add(follower)
            return JsonResponse(followed.serialize(),safe=False);
        else:
            print(f'unfollowing {profile}')
            follower.following.remove(followed)
            followed.followed.remove(follower)
            return JsonResponse(followed.serialize(),safe=False)

    #Get specified user's profile (User object)
    elif request.method == "USER":
        user = User.objects.get(username=profile)
        return JsonResponse(user.serialize(), safe=False)

    #Like or unlike a post
    elif request.method == "LIKE":
        prof = User.objects.get(username=profile)
        user = request.user
        data = json.loads(request.body)
        post = Post.objects.get(id=data.get("post", ""))
        if not post.liked.filter(username=user.username).exists():
            print(f'Post liked :{post}')
            post.liked.add(user)
            posts = Post.objects.filter(poster=prof)
            posts = posts.order_by("-timestamp").all()  # Return posts in chronologial order
            paginator = Paginator(posts, POSTS_PER_PAGE) 
            page_obj = paginator.get_page(page)
            response = JsonResponse(
            { 
            'posts': [post.serialize() for post in page_obj.object_list], 
            'page': page, 
            'end': paginator.num_pages,
            'hasNext': page_obj.has_next(),
            'hasPrevious': page_obj.has_previous(),
            },
             safe=False)
            return response
        else:
            print(f'Post unliked :{post}')
            post.liked.remove(user)
            posts = Post.objects.filter(poster=prof)
            posts = posts.order_by("-timestamp").all()  # Return posts in chronologial order
            paginator = Paginator(posts, POSTS_PER_PAGE)
            page_obj = paginator.get_page(page)
            response = JsonResponse(
            { 
            'posts': [post.serialize() for post in page_obj.object_list], 
            'page': page, 
            'end': paginator.num_pages,
            'hasNext': page_obj.has_next(),
            'hasPrevious': page_obj.has_previous(),
            },
             safe=False)
            return response


@csrf_exempt
def following(request, page=1):
    if request.method == "GET":
         return render(request, "network/following.html") 
         
    #Get all posts
    elif request.method == "POST":
        user = User.objects.get(username=request.user.username)
        posts = Post.objects.filter(poster__in=user.following.all())
        posts = posts.order_by("-timestamp").all()  # Return posts in chronologial order
        paginator = Paginator(posts, POSTS_PER_PAGE) 
        page_number = page
        page_obj = paginator.get_page(page_number)
        response = JsonResponse(
            { 
            'posts': [post.serialize() for post in page_obj.object_list], 
            'page': page, 
            'end': paginator.num_pages,
            'hasNext': page_obj.has_next(),
            'hasPrevious': page_obj.has_previous(),
            },
            safe=False)
        
        return response

    #Like/Unlike post
    elif request.method == "LIKE":
        user = request.user
        data = json.loads(request.body)
        post = Post.objects.get(id=data.get("post", ""))
        if not post.liked.filter(username=user.username).exists():
            print(f'Post liked :{post}')
            post.liked.add(user)
            posts = Post.objects.all()
            posts = posts.order_by("-timestamp").all()  # Return posts in chronologial order
            paginator = Paginator(posts, POSTS_PER_PAGE)
            page_number = page
            page_obj = paginator.get_page(page_number)
            response = JsonResponse(
            { 
            'posts': [post.serialize() for post in page_obj.object_list], 
            'page': page, 
            'end': paginator.num_pages,
            'hasNext': page_obj.has_next(),
            'hasPrevious': page_obj.has_previous(),
            },
             safe=False)
            
            return response

        else:
            print(f'Post unliked :{post}')
            post.liked.remove(user)
            posts = Post.objects.all()
            posts = posts.order_by("-timestamp").all()  # Return posts in chronologial order
            paginator = Paginator(posts, POSTS_PER_PAGE)
            page_number = page
            page_obj = paginator.get_page(page_number)
            response = JsonResponse(
            { 
            'posts': [post.serialize() for post in page_obj.object_list], 
            'page': page, 
            'end': paginator.num_pages,
            'hasNext': page_obj.has_next(),
            'hasPrevious': page_obj.has_previous(),
            },
             safe=False)
            
            return response
