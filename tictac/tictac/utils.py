# Calculates the score after the end of the match
# Depending on how many turns have passed
# Different amount of points are added or removed
def CalculateScore (turn, won):
    if won == "Won":
        if turn < 7:
            score = 3
        elif turn < 9:
            score = 2
        else:
            score = 1
    elif won == "Lost":
        if turn < 7:
            score = -3
        elif turn < 9:
            score = -2
        else:
            score = -1
    elif  won == "Tie":
        score = 0
    return score

#Ensures score is positive or zero
def NotZero(score):
    if score < 0:
        return 0
    return score;