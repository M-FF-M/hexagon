#include <bits/stdc++.h>
using namespace std;

const int F = 21; // triangle with 5 lines has 15 fields
int state[F] = {0, 0, 0, 0, 0, 0, 0, -1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0}, m = -2; // game board
vector < int > s[F]; // adjacency of fields
int frf[F];	// array of free fields
int p = 0;	// amount of free fields (length of frf)


void init() {
	ifstream st("settings21");
	for (int i = 0; i < F; i++) {
	 	int l;
	 	st >> l;
	 	for (int j = 0; j < l; j++) {
	 		int x;
	 		st >> x;
	 		s[i].push_back(x);
	 	}
	}
	for (int i = 0; i < F; i++) {
		if (state[i] == 0)
			frf[p++] = i;
	}
	st.close();
}

void print() {
	int c = 0;
	cout << endl;
	for (int l = 1; l*(l+1) <= 2*F; l++) {
	 	for (int i = 0; i < 5-l+2; i++)
	 		cout << "  ";
	 	for (int i = 0; i < l; i++)
	 		if (state[c] > 0)
	 			printf("+%d  ", state[c++]);
	 		else if (state[c] < 0)
		 		printf("% 2d  ", state[c++]);
		 	else
		 		printf(" %d  ", state[c++]);
	 	cout << endl;
	}
	cout << "Next: " << m << endl;
	cout << "Free: " << p << endl;
}

int check() {
	assert(p == 1);
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

int solve(int beta_pruning, bool debug = false) {
 	if (p == 1) {
 		int res = check();
 	 	return res <= 0 ? -1 : 1;
 	}

	int res = -100;
	for (int i = 0; i < p && i < 2 && ((res <= 0 && res < beta_pruning) || debug); i++) {
		int x = frf[rand() % p];
	 	assert(state[x] == 0);

	 	state[x] = m;
	 	m = next(m);
	 	p--;
		swap(frf[i], frf[p]);

	 	int cur = -solve(debug ? 100 : -res);

	 	if (debug) {
			if (cur > 0)
				cout << "WIN with " << x << endl;
			else if (cur == 0)
				cout << "DRAW with " << x << endl;
			else
				cout << "LOSE with " << x << endl;
	 	}

		res = max(res, cur);
		
		swap(frf[i], frf[p]);
		p++;
		state[x] = 0;
		m = prev(m);
	}

	return res;
}

int main() {
	double start = clock();
	init();
	print();
	cout << solve(100, true) << endl;
	cout << (clock() - start) / CLOCKS_PER_SEC << endl;

 	return 0;
}