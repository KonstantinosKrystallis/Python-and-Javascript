from django import forms
from .models import Comment, Listing, Bid, Watchlist
  
class CommentForm(forms.ModelForm):
    content = forms.CharField(label ="", widget = forms.Textarea(
    attrs ={
        'id':'comment-box',
        'class':'form-control',
        'placeholder':'Comment here !',
    }))

    class Meta:
        model = Comment
        fields =['content']

class ListingForm(forms.ModelForm):
    name = forms.CharField(label="Name", max_length=128)
    description = forms.CharField(label ="Description", widget = forms.Textarea(
    attrs ={
        'id':'description-box',
        'class':'form-control',
        'placeholder':'Write product description here !',
    }))
    startingBid = forms.DecimalField(max_digits=12,decimal_places=2)
    image = forms.CharField(label ="Image(Optional)", required=False, widget = forms.Textarea(attrs ={
        'id':'image-box',
        'class':'form-control',
        'placeholder':'Put image url here (optional)!',
    }))
    category = forms.CharField(max_length=64, required=False, label ="Category(Optional)", initial="")

    class Meta:
        model = Listing
        fields =['name','description','startingBid','image','category']


class BidForm(forms.ModelForm):
    amount = forms.DecimalField(max_digits=12,decimal_places=2)
    
    class Meta:
        model = Bid
        fields = ['amount']