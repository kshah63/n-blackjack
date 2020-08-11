'use strict';

const ranInt = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
};

// bot's actions (as dealer) after player finishes turn
const botisaddcard = (botCards, say) =>{
    var cardArr = botCards.split('/');
    // dealer reveals face down card
    var strArr = [];

    var card2Str = "My second card is " + toString(cardArr[1]);
    strArr.push(card2Str);

    // draw until it has 17 (without an Ace) or goes over 21
    // special case for soft 17 (an Ace and other cards that sum to 6): hit or stand?
    var hit = 1;

    while (hit === 1) {
        var sum = sumCards(botCards);

        if (sum > 21) {
            hit = 0;
            var bustStr = "My sum is over 21";
            strArr.push(bustStr);
            break;
        }

        // total is 16 or lower: must add a card
        if (sum <= 16) {
            var newCard = sendCard();
            var newString1 = "I want to add a card!";
            var newString2 = 'I got a ' + toString(newCard);
            strArr.push(newString1);
            strArr.push(newString2);
            botCards = botCards + '/' + newCard;
        }

        else {
            hit = 0;
            var standStr = "I want to stand";
            strArr.push(standStr);
        }
    }
    return [botCards, strArr];
};


// takes in 2D array of cards
const sumCards = (cards) =>{
    var ace = 0;
    if (cards == '0') return 0;
    var sum = 0;
    var allCardsArray = cards.split('/');
    for (var i = 0; i < allCardsArray.length; i++) {
        var cardArray = allCardsArray[i].split(',');
        var num = parseInt(cardArray[1]);
        if (num >= 10) {
            sum += 10;
        }
        else if (num == 1) {
            sum++;
            ace++;
        }
        else sum += num;
    }
    if (ace === 0)
        return sum;
    else {
      var diff = 21 - sum;
      if (diff >= 10)
        sum +=10;
      return sum;
    }
};

const compare = (botcards,playercards) =>{//duel =1 ,game start

    var playersum = sumCards(playercards);
    var botsum = sumCards(botcards);
    var playking, botking;

    if(playercards.length == 2 && playersum == 21)
        playking = 1;
    if(botcards.length == 2 && botsum == 21)
        botking = 1;

    if(botsum<=21&&playersum<=21){
        if(botsum>playersum)
            return 1;//bot win
        if(botsum === playersum){
            if(playking == 1 && botking !== 1)
                return 0;//player win AJ
            else if(botking == 1 && playking !== 1)
                return 1;//bot win AJ
            else if(botking == 1 && playking == 1)
                return 2;//two AJ
            else
                return 2;//draw
        }

        if(botsum < playersum)
            return 0;//player win
    }
    if(botsum>21){
        if(playersum>21)
            return 1;//bot win all full means bot win
        else
            return 0;//player win
    }
    if(playersum>21){
        return 1;//bot win
    }

};

const sendCard = () =>{
    if(pos == 51){
        pos = -1;
        deck = shuffledDeck();
    }

    pos++;
    return deck[pos];
};

const shuffledDeck = () =>{
    var newDeck = new Array(52);
    var num = 1;

    for(var i = 0; i < 52; i ++){
        newDeck[i] = i%4 + "," + num;

        if(i % 4 == 3)
            num ++;
    }

    for(i = 0; i < 52-1; i ++){
        var index = ranInt(0,52-1 -i) + i+1;

        var temp = newDeck[i];
        newDeck[i] = newDeck[index];
        newDeck[index] = temp;
    }

    return newDeck;
};

const cardcolor = (color) =>{
    var arr = new Array(4);//    =♠❤♦♣
    arr[0]="♠";
    arr[1]="❤";
    arr[2]="♣";
    arr[3]="♦";

    return arr[color];
};

// returns text representation of cards
const toString = (card) => {
    var cards = card.split(',');
    if (cards[1] === '11') {
        return 'J' + ' ' + cardcolor(card[0]);
    }
    if (cards[1] === '12') {
        return 'Q' + ' ' + cardcolor(card[0]);
    }
    if (cards[1] === '13') {
        return 'K' + ' ' + cardcolor(card[0]);
    }
    if (cards[1] === '1') {
        return 'A' + ' ' + cardcolor(card[0]);
    }

    return cards[1] + ' ' + cardcolor(cards[0]);
};

const getFitness = (action, playerCards, botCard) => {
    var origSum = sumCards(playerCards);
    if(action.localeCompare('hit') === 0){
        var newCard = deck[ranInt(0,52)];
        playerCards += '/' + newCard;
    }

    var botCards = botCard;
    while(sumCards(botCards) < 17){
        var ranCard = deck[ranInt(0,52)];
        botCards = botCard +'/' + ranCard;
    }

    var sumBot = sumCards(botCards);
    var sumPlayer = sumCards(playerCards);
    var win = compare(botCards, playerCards);
    var risk;
    if(win === 0 || sumPlayer <= 21){
        risk = 0;
        if(action.localeCompare('hit') === 0 && origSum > 16)
            risk = 5 - (21-origSum);
        return 100 - (21-sumPlayer) - risk;
    }
    else{
        risk = 0;
        if(action.localeCompare('hit') === 0 && origSum < 17)
            risk = (21-origSum);
        return 90 - (sumPlayer - 21) + risk;
    }
};

const getResult = (cards)=> {
    var result= ' ';
    var arrayCards = cards.split('/');
    var num = arrayCards.length;
    for (var i = 0; i < num - 1; i++) {
        result = result + toString(arrayCards[i]) + ', ';
    }
    result += toString(arrayCards[num-1]);
    return result;
};

const oned2d = (index) => {
    if (index <= 150 && index >= 90) {
        return [index / 10, index % 10, 0];
    }
    else if (index >= 190) {
        var newIndex = index - 100;
        return [newIndex / 10, newIndex % 10, 1];
    }

    else
        return [index/10, index % 10];
};

const calcFitness = (action, a, b, c) => {
    var playercard; var botcard; var fitness; var cards; var index; var aceIndex;
    var i = parseInt(a); var j = parseInt(b); var ace = parseInt(c);

    if (i > 15) {
        cards = parseInt(i) - 7;
        playercard = '1,' + cards + '/1,9';
        botcard = '1,' + j;
        index = i*10 + j;
        fitness = getFitness(action, playercard, botcard);
        return [index, fitness];
    }
    else if (i < 9) {
        playercard = '1,' + i + '/1,2';
        botcard = '1,' + j;
        index = i*10 + j;
        fitness = getFitness(action, playercard, botcard);
        return [index, fitness];
    }
    else if (ace === 0) {
        cards = parseInt(i) - 6;
        playercard = '1,' + cards + '/1,8';
        botcard = '1,' + j;
        index = i*10 + j;
        fitness = getFitness(action, playercard, botcard);
        return [index, fitness];
    }
    else {
        cards = parseInt(i) - 6;
        playercard = '1,' + cards + '/1,7/1,1';
        botcard = '1,' + j;
        aceIndex = i*10 + j + 100;
        fitness = getFitness(action, playercard, botcard);
        return [index, fitness];
    }
};

const createMatrix = () => {
    var matrix = new Array(19);
    var fitnesses = new Array(260);
    var int; var fitness; var temp; var aceTemp; var aceInt;

    // i = sum-2
    // j = botCard
    // index = i*10 + j [if no Ace]
    // index = i*10 + j + 100 [if Ace]
    for (var i = 0; i < matrix.length; i++) {
        matrix[i] = new Array(10);
    }

    for (i = 0; i < matrix.length; i++) {
        for (var j = 0; j < matrix[0].length; j++) {
            if (i > 15) {
                int = ranInt(0,9);
                if (int === 0) {
                    matrix[i][j] = new Array[2];
                    matrix[i][j][0] = 'hit';
                }
                else
                    matrix[i][j][0] = 'stand';
                temp = calcFitness(matrix[i][j][0], i, j);
                fitnesses[temp[0]] = temp;
            }
            else if (i < 9) {
                int = ranInt(0,99);
                if (int < 85){
                    matrix[i][j] = new Array[2];
                    matrix[i][j][0] = 'hit';
                }
                else
                    matrix[i][j][0] = 'stand';
                temp = calcFitness(matrix[i][j][0], i, j);
                fitnesses[temp[0]] = temp;
            }
            else if (j == 4 || j == 5 || j ==6) {
                int = ranInt(0,99);
                if (int < 25){
                    matrix[i][j] = new Array[2];
                    matrix[i][j][0] = 'hit';
                }
                else
                    matrix[i][j][0] = 'stand';
                temp = calcFitness(matrix[i][j][0], i, j);
                fitnesses[temp[0]] = temp;
                aceInt = ranInt(0,9);
                if (aceInt < 4)
                    matrix[i][j][1] = 'hit';
                else
                    matrix[i][j][1] = 'stand';
                temp = calcFitness(matrix[i][j][1], i, j);
                fitnesses[temp[0]] = temp;
            }
            else {
                int = ranInt(0,99);
                if (int < 55) {
                    matrix[i][j] = new Array[2];
                    matrix[i][j][0] = 'hit';
                }
                else
                    matrix[i][j][0] = 'stand';
                temp = calcFitness(matrix[i][j][0], i, j);
                fitnesses[temp[0]] = temp;
                aceInt = ranInt(0,9);
                if (aceInt < 7)
                    matrix[i][j][1] = 'hit';
                else
                    matrix[i][j][1] = 'stand';
                temp = calcFitness(matrix[i][j][1], i, j);
                fitnesses[temp[0]] = temp;
            }
        }
    }
    fitnesses.sort(function(a,b) {
       return a[1] - b[1];
    });
    var action; var newAction;
    for (i = 0; i < 10; i++) {
        for (var k = 0; k < 10; k++) {
            var index = fitnesses[k][0];
            var twoIndex = oned2d(index);
            if (twoIndex.length == 2) action = matrix[twoIndex[0]][twoIndex[1]];
            else action = matrix[twoIndex[0]][twoIndex[1]][twoIndex[2]];
            if (action == 'hit') newAction = 'stand';
            else newAction = 'hit';
            fitness = getFitness(newAction, i, k);
            if (fitness > fitnesses[k][1]) {
               fitnesses[k][1] = fitness;
               if (twoIndex.length == 2) matrix[twoIndex[0]][twoIndex[1]] = newAction;
               else matrix[twoIndex[0]][twoIndex[1]][twoIndex[2]] = newAction;
           }
       }
       fitnesses.sort(function(a, b) {return a[1] - b[1]; });
   }
   return matrix;
};

const checkAce = (cards) => {
  var array = cards.split('/');
  var ace = false;
  for (var i = 0; i < array.length; i++) {
      var card = array[i].split(',');
      if (parseInt(card[1]) == 1) {
               ace = true;
               break;
      }
  }
  return ace;
};

var deck = shuffledDeck();
var pos = -1;
var matrix = createMatrix();

const start = (say, sendButton) => {
    say(['This is a classic card game called BlackJack','Rules: Each player will start with 2 cards. Add up the sum of the digits of the cards; if you think the sum is too small, you can add another card. Whoever gets the larger sum wins. However, if your sum is bigger than 21, then you lose.','Reminder:, Ace can have a value of 1 or 11, and J,Q,K have a value of 10. Good luck!']).then(() => {
        sendButton('Would you like to play the game?', [{title: 'Yes', payload: '1-0-0-0'}, {title: 'No', payload: '0-0-0-0'}]);
    });
};

const state = (payload, say, sendButton) => {
    const array = payload.split('-');
    // playerCards and botCards are arrays
    var play = parseInt(array[0]); var hitPlayer = parseInt(array[1]); var playerCards = array[2]; var botCards = array[3];
    var ace = checkAce(playerCards); var botCard = botCards.split('/')[0].split(',')[1]; var action;

    if (play == 1) {
        var sumPlayer = sumCards(playerCards);
        var sumBot = sumCards(botCards);

        // if neither have cards yet, need to add 2 cards
        if (sumPlayer === 0) {
            var card1Player = sendCard(); var card2Player = sendCard(); var card1Bot = sendCard(); var card2Bot = sendCard();
            var str = "Game start!!Your 2 cards are " + toString(card1Player) + " and " + toString(card2Player);
            var str1 = "One of my cards is " + toString(card1Bot);
            playerCards = card1Player + '/' + card2Player; botCards = card1Bot +'/' + card2Bot;
            say([str, str1]).then(() => {
                sendButton('would you like to add a card?', [{ title: 'yes', payload: `${1}-${1}-${playerCards}-${botCards}`}, {title: 'No, I want to stand!', payload:`${1}-${0}-${playerCards}-${botCards}` }]);
            });
        }

        // if they have cards < 21, need to check if player is hitting or standing or spliting

        if (hitPlayer === 0 && sumPlayer !== 0) {
            // simulate bot plays
            // store the plays and push them as string at the end to let player know of bot plays
            // who plays first? if player goes first, isn't bot's play determined --> let bot play first?
            // update bot sum
            
                        // feedback testing 
            
            if (ace === false) {
                 action = matrix[sumPlayer-2][botCard];
                if (action == 'hit') {
                    say('Oops.. you chose to stand, but given your cards and the card the dealer was showing, it would have been a better choice to hit!');
                }
                else say('Yay! You made the right choice by choosing to stand!');
            }
            else {
                action = matrix[sumPlayer-2][botCard][1];
                 if (action == 'hit') {
                    say('Oops.. you chose to stand, but given your cards and the card the bot was showing, it would have been a better choice to hit!');
                }
                else say('Yay! You made the right choice by choosing to stand!');
            }
            
            // end
            var ans = botisaddcard(botCards, say);
            botCards = ans[0];
            say(ans[1]).then(() => {
                var result= getResult(botCards);
                var showBotCards = 'My cards are' + result;
                say(showBotCards).then(() => {
                    var state = compare(botCards, playerCards);
                    if (state === 0) {
                        say('Congratulations! You win!').then(() => {
                          sendButton('Play again?', [
                              {title: 'Yes!', payload: '1-0-0-0'},
                              'No']);
                      });
                    }
                    else if (state == 2) {
                        say('Congratulations! Game is tied').then(() => {
                            sendButton('Play again?', [
                              {title: 'Yes!', payload: '1-0-0-0'},
                              'No']);
                        });
                    }


                    else{
                        say('Sorry! Bot won :(').then(() => {
                            sendButton('Play again?', [
                              {title: 'Yes!', payload: '1-0-0-0'},
                              'No']);
                        });
                    }
                });
            });
        }

        if (hitPlayer == 1) {
             if (ace === false) {
                 action = matrix[sumPlayer-2][botCard];
                if (action == 'stand') {
                    say('Oops.. you chose to hit, but given your cards and the card the bot was showing, it would have been a better choice to stand!');
                }
                else say('Yay! You made the right choice by choosing to hit!');
            }
            else {
                action = matrix[sumPlayer-2][botCard][1];
                 if (action == 'hit') {
                    say('Oops.. you chose to stand, but given your cards and the card the bot was showing, it would have been a better choice to hit!');
                }
                else say('Yay! You made the right choice by choosing to stand!');
            }
            var newCard = sendCard();
            var newString1 = 'You got a ' + toString(newCard);
            playerCards = playerCards + '/' + newCard;
            var result= getResult(playerCards);
            var newString2 = 'Your cards are' + result;
            if (sumCards(playerCards) > 21) {
                say([newString1, newString2, 'Sorry, your sum is over 21 :( Bot wins']).then(() => {
                    sendButton('Play again?', [
                        {title: 'Yes!', payload: '1-0-0-0'},
                        'No']);
                });
            }
            else {
                say([newString1, newString2]).then(() => {
                    sendButton('would you like to add a card?', [{ title: 'yes', payload: `${1}-${1}-${playerCards}-${botCards}`}, {title: 'No, I want to stand!', payload:`${1}-${0}-${playerCards}-${botCards}` }]);
                });
            }
        }
    }
    if (play === 0) {
        say('Okay, lets play next time!');
    }
};

module.exports = {
    filename: 'helloworld',
    title: 'BlackJack',
    introduction: "Welcome to BlackJack!",
    start: start,
    state: state
};
