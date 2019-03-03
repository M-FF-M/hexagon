#include <bits/stdc++.h>
using namespace std;

const int F = 15;

int state[F] = {0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0}, m = -1;
vector < int > s[F];
int frf[F], p = 0;


void init() {
	ifstream st("settings15");
	for (int i = 0; i < F; i++) {
	 	int l;
	 	st >> l;
	 	for (int j = 0; j < l; j++) {
	 		int x;
	 		st >> x;
	 		s[i].push_back(x);
	 	}
	}
}

void reset() {
	p = F;
	m = -1;
	for (int i = 0; i < F; i++) {
		state[i] = 0;
		frf[i] = i;
	}
}

void print(vector < int > ans) {
	for (int i = 0; i < F; i++)
		cout << state[i] << ' ';
	cout << endl << ans.size() << ' ';
	for (int x : ans)
		cout << x << ' ';
	cout << endl << endl;
}

int get_sum(int i) {
    int res = 0;
	for (int ind : s[i])
		res += state[ind];
	return res;
}

int check() {
	int i = frf[0];
	return get_sum(i);
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

void do_move(int i) {
	assert(state[frf[i]] == 0);

	state[frf[i]] = m;
	m = next(m);
	p--;
	swap(frf[i], frf[p]);
}

void undo_move(int i) {
	swap(frf[i], frf[p]);
	p++;
	state[frf[i]] = 0;
	m = prev(m);
}

int sgn(int x) {
 	if (x == 0)
 		return 0;
 	else
 		return x > 0 ? 1 : -1;
}

int solve(bool wm = false, vector<int> *ans = NULL) {
	if (p == 1)
		return check();

	int res = -1, k = -1;

	for (int i = 0; i < p && (res <= 0 || wm); i++) {
		do_move(i);

		int cur = sgn(-solve());
		
		if (wm && cur > res)
			ans->clear();
		res = max(res, cur);
		if (wm && cur == res)
			ans->push_back(frf[p]);

		undo_move(i);
	}

	return res;
}

int main() {
	init();
	reset();

	for (int m = 2; m < F - 1; m++) {
		int K = m == 2 ? 100 : 1000;
		for (int k = 0; k < K; k++) {
			// generate position
		 	for (int j = 0; j < m; j++)
	 		 	do_move(rand() % p);
	 		
	 		// solve position
	 		vector < int > ans;
	 		solve(true, &ans);

	 		// print
	 		print(ans);

	 		// reset
	 		reset();
	 	}
	 	cerr << m << ' ' << (clock() / CLOCKS_PER_SEC) << endl;
	}

	return 0;
}