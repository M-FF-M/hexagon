# Scripts:
- generate_15 -	generates random positions, solves them and saves
- BF_15 -	solves given position with brute-force method
- BF_21 -	solves given position with brute-force method and caching (probabilistic)

# Files:
- settings15, settings21 - settings for solvers
- start_positions - all possible positions after 0 and 1 move and solutions of them
- test_positions - random positions after 2, 3, ..., 12 and 13 moves and solutions of them

# Position format:
- first line describes position line by line; it consists of 15 numbers: 0 means that cell is free, negative numbers belong to first player
- second line describes right moves: at the beginning is the number of right moves, than follow appropriate cells indices