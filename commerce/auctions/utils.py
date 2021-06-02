from .models import Bid
import itertools

#This gets all Bid  objects that have the max 'ammount' for each unique 'prodId'(Listing)
def find_max():
    qs = Bid.objects.all()
    filtered = []
    group_by = itertools.groupby(qs, lambda x: x.prodId)
    for x in group_by:
        filtered.append(sorted(x[1], key=lambda x: x.amount, reverse=True)[0])
    return filtered
