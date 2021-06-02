import random
from markdown2 import Markdown

from django import forms
from django.shortcuts import render
from django.http import HttpResponseRedirect
from django.urls import reverse
from django.contrib import messages

from . import util


class NewPageForm(forms.Form):
    pageTitle = forms.CharField(label="New Page Title", required=True) #required makes sure the form has some conternt in it
    pageContent = forms.CharField(label="",widget=forms.Textarea)

def index(request):
    return render(request, "encyclopedia/index.html", {
        "entries": util.list_entries()
    })


# This function handles the pages navigation
# It's probalby not the best way of doing it, but it worked first so yeah.. 
def wiki_page(request, page):
        if page == 'create_page':
            return create_page(request)
        elif page == 'random':
            return random_page(request)
        elif page == 'search':
            return search_page(request)
        elif page == 'edit':
            return edit_page(request, page)
        elif page in util.list_entries():
            mark = Markdown()
            html = mark.convert(util.get_entry(page) )
            return render(request, "encyclopedia/page.html",{
                "tittle": page,
                "page":  html
            })
        else:
            return render(request, "encyclopedia/notfound.html",{
                "tittle": page,
            })


def create_page(request):
    if request.method == 'POST':
        form = NewPageForm(request.POST)
        if form.is_valid():
            title = form.cleaned_data["pageTitle"]
            content = form.cleaned_data["pageContent"]
            if title in util.list_entries():
                return render(request, "encyclopedia/newpage.html", {
                "message": "Entry already exist",
                "form": form
                })
            util.save_entry(title, content)
            return HttpResponseRedirect(reverse('page', args= [title]))
        else:
            return render(request, "encyclopedia/newpage.html", {
            "form": form
            })
    else:
        return render(request, "encyclopedia/newpage.html", {
            "form": NewPageForm()
        })


#This returns a random entry from the wiki
def random_page(request):
    return HttpResponseRedirect(reverse('page', args = [random.choice(util.list_entries())]))


#This enables the search of entries on the wiki
def search_page(request):
    if request.method == 'GET': # this will be GET now      
        querry =  request.GET.get('search') # do some research what it does       
        entries = util.list_entries()
        res = [sub for sub in entries if querry.lower() in sub.lower()]
        if querry in entries:
            return wiki_page(request, querry)
        elif res :
            return render(request, "encyclopedia/search.html", {
                "querry": querry,
                "entries": res 
            })
        else:
            return render(request, "encyclopedia/search.html", {
                "querry": querry
            })
    else:
        return render(request,"encyclopedia/index.html")

def edit_page(request, page):
    if request.method == 'POST':
        form = NewPageForm(request.POST)
        if form.is_valid():
            content = form.cleaned_data["pageContent"]
            content = removeEmptyLines(content)
            util.save_entry(page, content)
            return HttpResponseRedirect(reverse('page', args= [page]))
        else:
            return render(request, "encyclopedia/newpage.html", {
            "form": form
            })
    else:
        form = NewPageForm(initial={'pageTitle': page,'pageContent': util.get_entry(page)})
        return render(request, "encyclopedia/editpage.html", {
            "title": page,
            "form": form
        })

#Using this function to prevent the files filling up with empty lines
def removeEmptyLines(str):
    lines = str.split("\n")
    content = [line for line in lines if line.strip() != ""]
    output = ""
    for line in content:
      output += line + "\n"
    return output
