from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator, MaxValueValidator

from .utils import CalculateScore, NotZero

# Create your models here.

class User(AbstractUser):
    score = models.PositiveBigIntegerField(default=0)
    watch_list = models.ManyToManyField('self', related_name='watched', default='', blank=True, symmetrical=False)

    def serialize(self):
        return {
            "username": self.username,
            "score": self.score,
        }

    def loadProfile(self):
        GAMES_PER_PAGE = 20
        games = self.gamer.all()
        games = games.order_by('-timestamp')

        return {
            "username": self.username,
            "score": self.score,
            "games": [game.serialize() for game in games],

        }
    
    def getWatchList(self):
        return self.watch_list.all()

    def getGames (self):
        return self.gamer.all()

class Game(models.Model):
    player = models.ForeignKey(User, related_name='gamer',on_delete=models.DO_NOTHING, blank=True, null=True)
    timestamp = models.PositiveBigIntegerField(default=0)
    turn = models.IntegerField(default=0, validators=[MinValueValidator(0), MaxValueValidator(10)])
    WON = 'W'
    LOST = 'L'
    TIE = 'T'
    WON_CHOISES = [(WON, 'Won'),(LOST, 'Lost'), (TIE, 'Tie')]
    won = models.CharField( max_length=5, choices=WON_CHOISES, default=LOST)
    done = models.BooleanField(default=False)

    def __str__(self):
        return f"Game{self.id} | {self.timestamp} : {self.player}, turn: {self.turn}, result: {self.won}"
    
    def serialize(self):
        return {
            "timestamp": self.timestamp,
            "turn": self.turn,
            "won": self.won,
            "done": self.done,
        }
    
    def debug_serialize(self):
        return {
            "player": self.player.username,
            "timestamp": self.timestamp,
            "turn": self.turn,
            "won": self.won,
            "done": self.done,
        }