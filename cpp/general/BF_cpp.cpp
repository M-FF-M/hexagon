#include <string>
#include <cstring>
#include <ctime>
#include <vector>
#include <iostream>
#include <fstream>
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

void init_from_file(string filename, int Fnum, int startNum, int* stateinfo) {
	F = Fnum;
	m = startNum;
	ifstream st(filename);
	for (int i = 0; i < Fnum; i++) {
		s[i].clear();
	 	int l;
	 	st >> l;
	 	for (int j = 0; j < l; j++) {
	 		int x;
	 		st >> x;
	 		s[i].push_back(x);
	 	}
	}
	st.close();
	init_state(stateinfo);
}

void init_from_adj(vector< vector< int > >& adj, int Fnum, int startNum, int* stateinfo) {
	F = Fnum;
	m = startNum;
	for (int i = 0; i < Fnum; i++) {
		s[i].clear();
	 	for (int j = 0; j < adj[i].size(); j++) {
	 		s[i].push_back(adj[i][j]);
	 	}
	}
	init_state(stateinfo);
}

int solve_start() {
	int* sol = new int[F];
	int res = solve_current(sol);
	
	for (int i = 0; i < p; i++) {
		int x = frf[i];
		if (sol[x] > 0)
			cout << "WIN with " << x << endl;
		else if (sol[x] == 0)
			cout << "DRAW with " << x << endl;
		else
			cout << "LOSE with " << x << endl;
	}
	
	delete[] sol;
	return res;
}

int solve_noout() {
	return solve(MAXSUM);
}

vector< vector< int > > get_from_file(string filename, int Fnum) {
	vector< vector< int > > ret;
	ifstream st(filename);
	for (int i = 0; i < Fnum; i++) {
		ret.push_back(vector< int >());
	 	int l;
	 	st >> l;
	 	for (int j = 0; j < l; j++) {
	 		int x;
	 		st >> x;
	 		ret[i].push_back(x);
	 	}
	}
	st.close();
	return ret;
}

int get_bit(int num, int bit) {
	return (num >> bit) & 1;
}

void print_start_end(vector<int>& vec, int num) {
	if (vec.size() == 0) {
		cout << " > empty" << endl;
	} else if (vec.size() <= num * 2) {
		for (int i = 0; i < vec.size(); i++) {
			cout << " > " << vec[i] << endl;
		}
	} else {
		for (int i = 0; i < num; i++) {
			cout << " > " << vec[i] << endl;
		}
		cout << " > ..." << endl;
		for (int i = vec.size() - num; i < vec.size(); i++) {
			cout << " > " << vec[i] << endl;
		}
	}
}

void all_poss(vector< vector< int > >& adj, int Fnum) {
	if (Fnum > 15) cout << "ERROR: too many fields!" << endl;
	int startstate[15] = {0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0};
	int mp[15], bmp[15];
	vector< int > aWins;
	vector< int > bWins;
	vector< int > draw;
	int cfields = 1;
	for (; cfields < (1 << Fnum); cfields++) {
		int idx = 0;
		for (int i = 0; i < Fnum; i++) {
			if (get_bit(cfields, i)) { bmp[idx] = i; mp[i] = idx++; }
			else mp[i] = -1;
		}
		if (idx % 2) {
			vector< vector< int > > n_adj;
			for (int i = 0; i < idx; i++) {
				n_adj.push_back(vector<int>());
				int j = bmp[i];
				for (int k = 0; k < adj[j].size(); k++) {
					if (mp[ adj[j][k] ] >= 0) {
						n_adj[i].push_back(mp[ adj[j][k] ]);
					}
				}
			}
			init_from_adj(n_adj, idx, -1, startstate);
			int res = solve_noout();
			if (res > 0) aWins.push_back(cfields);
			else if (res < 0) bWins.push_back(cfields);
			else draw.push_back(cfields);
		}
		if (cfields % 1000 == 0 || cfields == (1 << Fnum) - 1) {
			cout << "progress: " << cfields << " / " << ((1 << Fnum) - 1) << endl;
			if (cfields % 5000 == 0 || cfields == (1 << Fnum) - 1) {
				cout << " > player 1 wins: " << aWins.size() << endl;
				cout << " > player 2 wins: " << bWins.size() << endl;
				cout << " > draws: " << draw.size() << endl;
			}
		}
	}
	cout << endl << "player 1 wins (" << aWins.size() << "):" << endl;
	print_start_end(aWins, 5);
	cout << endl << "player 2 wins (" << bWins.size() << "):" << endl;
	print_start_end(bWins, 5);
	cout << endl << "draws (" << draw.size() << "):" << endl;
	print_start_end(draw, 5);
	ofstream foutA("player1.txt");
	foutA << aWins.size() << endl;
	for (int i = 0; i < aWins.size(); i++) foutA << aWins[i] << endl;
	foutA.close();
	ofstream foutB("player2.txt");
	foutB << bWins.size() << endl;
	for (int i = 0; i < bWins.size(); i++) foutB << bWins[i] << endl;
	foutB.close();
	ofstream foutC("draw.txt");
	foutC << draw.size() << endl;
	for (int i = 0; i < draw.size(); i++) foutC << draw[i] << endl;
	foutC.close();
}

int main() {
	vector< vector< int > > adjl = get_from_file("settings15", 15);
	all_poss(adjl, 15);

	// double start = clock();
	// int startstate[15] = {0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0};
	// init_from_file("settings15", 15, -1, startstate);
	// set_time_limit(10);
	// cout << solve_noout() << endl;
	// cout << (clock() - start) / CLOCKS_PER_SEC << endl;

 	return 0;
}