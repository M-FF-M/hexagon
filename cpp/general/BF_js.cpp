// compile to WASM:
// emcc BF_js.cpp -std=c++11 -o bf.html -s EXPORTED_FUNCTIONS='["_set_time_limit", "_init_adj", "_init_state", "_solve", "_solve_current"]' -s EXTRA_EXPORTED_RUNTIME_METHODS='["ccall", "cwrap", "setValue", "getValue"]'
// to set emcc env variables in bash: navigate to emsdk folder and execute "source ./emsdk_env.sh"

#include <string>
#include <cstring>
#include <ctime>
#include <vector>
using namespace std;

const int MAXF = 102; // maximum number of fields
const int MAXSUM = 2000; // maximum rechable sum (with 50 moves the mx sum is 50*51/2 = 1275)
int F = 0; // number of fields
double MAXTIME = 20 * CLOCKS_PER_SEC; // maximum execution time, in seconds
double start_time = 0; // global execution start
int state[MAXF], m = -1; // game board state and next number to be placed (player 1 starts with -1)
vector < int > s[MAXF]; // field adjacency list
int frf[MAXF];	// array of free fields
int p = 0;	// amount of free fields (length of frf)
int glob_cnter = 0; // counts how often solve() is called

int check() {
	int i = frf[0];
	int res = 0;
	for (int ind : s[i])
		res += state[ind];
	return res;
}

int next(int m) {
 	if (m < 0)
 		return -m;
 	else
 		return -(m+1);
}

int prev(int m) {
 	if (m > 0)
 		return -m;
 	else
 		return -(m+1);
}

extern "C" {

/**
 * Set the execution time limit
 * @param secs the execution time limit in seconds
 */
void set_time_limit(int secs) {
	MAXTIME = max(1, secs) * CLOCKS_PER_SEC;
}

/**
 * Initializes the adjacency list
 * @param settings a pointer to an integer array:
 * at index 0: the number of fields, F
 * at index 1: the next number to be placed
 * then follow the adjacency lists in field index order, separated by -1 values -- there must be a terminating -1
 */
void init_adj(int* settings) {
	F = settings[0];
	m = settings[1];
	int idx = 2, j = 0;
	s[0].clear();
	while (j < F) {
		int nxt = settings[idx++];
		if (nxt == -1) {
			j++;
			s[j].clear();
		} else {
			s[j].push_back(nxt);
		}
	}
}

/**
 * Initializes the game board (should be called after init_adj)
 * @param stateinfo a pointer to an integer array of length F (F is specified via init_adj) which represents the state array
 */
void init_state(int* stateinfo) {
	memset(state, 0, sizeof state);
	p = 0;
	for (int i = 0; i < F; i++) {
		state[i] = stateinfo[i];
		if (state[i] == 0)
			frf[p++] = i;
	}
}

/**
 * Solves the current board
 * @param beta_pruning the value at which to stop searching
 */
int solve(int beta_pruning) {
	if (glob_cnter++ % 20000 == 0 && clock() - start_time > MAXTIME) return MAXSUM;

 	if (p == 1) {
 		int res = check();
 	 	return res;
 	}

	int res = -MAXSUM;
	for (int i = 0; i < p && res <= 0 && res < beta_pruning; i++) {
		int x = frf[i];

	 	state[x] = m;
	 	m = next(m);
	 	p--;
		swap(frf[i], frf[p]);

	 	int cur = -solve(-res);
		if (cur == -MAXSUM) return -MAXSUM;

		res = max(res, cur);
		
		swap(frf[i], frf[p]);
		p++;
		state[x] = 0;
		m = prev(m);
	}

	return res;
}

/**
 * Solve the current board
 * @param solarr an integer array with length F used to save the solution: after method execution, each index will contain a number
 * where 0 indicates DRAW, > 0 indicates WIN and < 0 indicates LOSS
 * @return > 0 if current player can win, < 0 if current player will lose, = 0 for draw
 * returns MAXSUM if time limit was reached or -MAXSUM if something went wrong
 */
int solve_current(int* solarr) {
	if (p <= 0) return -MAXSUM;
	if (p == 1) return check();

	start_time = clock();
	glob_cnter = 0;

	for (int i = 0; i < F; i++) {
		solarr[i] = 0;
	}

	int res = -MAXSUM;
	
	for (int i = 0; i < p; i++) {
		int x = frf[i];

	 	state[x] = m;
	 	m = next(m);
	 	p--;
		swap(frf[i], frf[p]);

	 	int cur = -solve(MAXSUM);
		if (clock() - start_time > MAXTIME) return MAXSUM;
		solarr[x] = cur;
		res = max(res, cur);

		swap(frf[i], frf[p]);
		p++;
		state[x] = 0;
		m = prev(m);
	}
	
	if (clock() - start_time > MAXTIME) return MAXSUM;
	return res;
}

}


int main() {
 	return 0;
}