# Hexagon

Play at https://m-ff-m.github.io/hexagon/.

The rules are simple:
- The game is played in turns.
- The first player places the numbers 1, 2, and so on.
- The second player places the numbers -1, -2, and so on.
- The first player wins if the sum of all numbers on fields bordering on empty fields is smaller than 0.
- The second player wins if the sum of all numbers on fields bordering on empty fields is greater than 0.
- Otherwise, the game ends in a draw.

A brute force solver is also included within the game. It was written in C++ and compiled to
[WebAssembly](https://webassembly.org/).