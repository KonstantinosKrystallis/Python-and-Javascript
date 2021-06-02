from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django.forms import ModelForm
from django.contrib.messages import constants as messages
from django.db.models import  Max, Count
from datetime import datetime    

from .models import User, Bid, Listing  ,Comment, Watchlist
from .forms import CommentForm, ListingForm, BidForm
from .utils import find_max

def index(request):
    #filtering via category
    if request.method == "POST" and 'filter' in request.POST:
        cat = request.POST.get('categories')
        if cat == 'All':
             listings = Listing.objects.filter(closed=False)
        elif cat == 'None':
            listings = Listing.objects.filter(closed=False).exclude( category__isnull=False)
        else:
            listings = Listing.objects.filter(closed=False, category=cat)
    else:
        listings = Listing.objects.filter(closed=False)
    cat = Listing.objects.order_by('category').values('category').distinct()
    catList = []
    for c in cat:
          catList.append(c['category'])

    #Get highest bid
    try:
        maxBid = Bid.objects.filter(prodId=id).aggregate(maxamount=Max('amount'))['maxamount']
        highestBid = Bid.objects.get(prodId=id, amount=maxBid)
    except: 
        highestBid = Bid(amount=0)

    highestBids = find_max()
    return render(request, "auctions/index.html",{
        'bids': highestBids,
        "list": listings,
        "cat": catList,
    })

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
            return render(request, "auctions/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "auctions/login.html")


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
            return render(request, "auctions/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "auctions/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "auctions/register.html")

def listing(request, id):
    listing = Listing.objects.get(id=id)
    try:
        user = User.objects.get(id=request.user.id) #using get because every id is unique
    except:
        user = None
    #This enables the comment system
    if request.method == 'POST' and 'comment' in request.POST:
            cf = CommentForm(request.POST)
            if cf.is_valid():
                content = request.POST.get('content')
                comment = Comment.objects.create(listing = listing, usrId = user, message = content)
                comment.save()
                return HttpResponseRedirect(reverse("listing", args=[id]))
            else:
                cf = CommentForm()
            return render(request, 'auctions/listing.html', {
            'comment_form':cf,
            })
    #Bidding system. It doesn't really check if a bid is higher
    # than the previous one or the starting one.
    elif request.method == 'POST' and 'bidin' in request.POST:
        cf = BidForm(request.POST)
        if cf.is_valid():
            bid = request.POST.get('amount')
            newBid = Bid.objects.create(prodId = listing, usrId = user, amount = bid)
            newBid.save()
            return HttpResponseRedirect(reverse("listing", args=[id]))
    #Close the listing
    elif request.method == 'POST' and 'close' in request.POST:
        Listing.objects.filter(id=id, creator=user).update(closed=True)
    #Add or remove form watchlist
    elif request.method == 'POST' and 'watch' in request.POST:
        watch, create = Watchlist.objects.get_or_create(user = user)
        if not create:
            watch.listing.add(listing)
    elif request.method == 'POST' and 'unwatch' in request.POST:
        watch = Watchlist.objects.get(user = user, listing = listing)
        watch.listing.remove(listing)
    try:
        maxBid = Bid.objects.filter(prodId=id).aggregate(maxamount=Max('amount'))['maxamount']
        highestBid = Bid.objects.get(prodId=id, amount=maxBid)
    except: 
        #If no bid is found return a temporary bid
        highestBid = Bid(prodId=listing, amount=0)
    comments = Comment.objects.filter(listing=id)
    cf = CommentForm()
    try:
        watch = Watchlist.objects.get(user = user, listing = listing)
    except:
        watch = None
    if watch and listing in watch.listing.filter(id=id):
        watched = True
        print('True')
    else:
        watched = False
        print('False')
    return render(request, "auctions/listing.html",{
        'watched': watched,
        "bid": highestBid,
        "item": listing,
        'bid_form': BidForm(), 
        'comment_form':cf,
        'comments':comments,
    })

@login_required
def create(request):
    if request.method == 'POST':
        form = ListingForm(request.POST)
        if form.is_valid():
            name =  request.POST.get('name')
            description =  request.POST.get('description')
            bid =  request.POST.get('startingBid')
            image =  request.POST.get('image')
            category = request.POST.get('category')
            user = User.objects.get(id=request.user.id)
            # if request.POST.get('category') != "":
            #     category= Category.objects.get(name=request.POST.get('category'))
            # else:
            #     category= Category.objects.get(name="Uncategorized")
            new_listing = Listing.objects.create(name=name, description=description, startingBid=bid, image=image, category=category, creator=user)
            new_listing.save()
            return HttpResponseRedirect(reverse("listing", args=[new_listing.id]))
    return render(request, "auctions/create.html",{
        "form": ListingForm()
    })

@login_required
def watchlist(request):
    user = User.objects.get(id=request.user.id)
    watch = Watchlist.objects.get(user = user)
    print(watch.listing.all())
    #filtering via category
    if request.method == "POST" and 'filter' in request.POST:
        cat = request.POST.get('categories')

        if cat == 'All':
            listings = Listing.objects.all()
        elif cat == 'None':
            listings = Listing.objects.exclude(category__isnull=False)
        else:
            listings = Listing.objects.filter(category=cat)
    else:
        listings = Listing.objects.all()
    cat = Listing.objects.order_by('category').values('category').distinct()
    catList = []
    for c in cat:
          catList.append(c['category'])

    #Get highest bid
    try:
        maxBid = Bid.objects.filter(prodId=id).aggregate(maxamount=Max('amount'))['maxamount']
        highestBid = Bid.objects.get(prodId=id, amount=maxBid)
    except: 
        highestBid = Bid(amount=0)

    highestBids = find_max()
    return render(request, "auctions/watchlist.html",{
        'watch': watch.listing.all(),
        'bids': highestBids,
        "list": listings,
        "cat": catList,
    })