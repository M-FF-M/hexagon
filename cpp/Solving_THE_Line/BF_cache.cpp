#include <bits/stdc++.h>
using namespace std;

const int MAXF = 500;
int state[MAXF], frf[MAXF];
int F, f, m;

map<map<int,int>, int> cache;


void reset() {
 	for (int i = 0; i < F + 2; i++)
 		state[i] = 0;
	for (int i = 0; i < F; i++)
		frf[i] = i + 1;
 	f = F;
	m = -1;
}

void print() {
	for (int i = 1; i <= F; i++)
		cout << state[i] << ' ';
	cout << endl << "Free: " << f << endl;
	for (int i = 0; i < f; i++)
		cout << frf[i] << ' ';
	cout << endl;
}

// -3 - positiv
// -2 - 0
// -1 - negativ

void comp_dict(map<int,int> &res) {
	int l = 0, i = 1;
	while (i <= F) {
		while (state[i] && i <= F) i++;
		while (state[i] == 0 && i <= F) i++, l++;
		if (l == 1) {
			if (state[i - 2] + state[i] > 0)
				res[-3]++;
			else if (state[i - 2] + state[i] == 0)
				res[-2]++;
			else
				res[-1]++;
		} else {
			res[l]++;
		}
		l = 0;
	}
}

void next() {
	m = m < 0 ? -m : -(m + 1);
}

void prev() {
	m = m > 0 ? -m : -(m + 1);
}

int check() {
	int i = 1;
	while (state[i])
		i++;
	return state[i - 1] + state[i + 1];
}

int solve(bool deb = false) {
 	if (f == 1)
 		return check();
	
	map<int,int> hsh;
	if (m < 0) {
		comp_dict(hsh);
		if (cache.count(hsh))
			return cache[hsh];
	}

	int res = -MAXF*MAXF;
	for (int i = 0; i < f && (res <= 0 || deb); i++) {
		int x = frf[i];
	 	assert(state[x] == 0);

		state[x] = m;
		next();
		f--;
		swap(frf[i], frf[f]);
		res = max(res, -solve());
		if (deb)
			cout << x << ' ' << res << endl;
		swap(frf[i], frf[f]);
		f++;
		state[x] = 0;
		prev();
	}

	if (m < 0)
		cache[hsh] = res;
	return res;
}

void print(map<int,int> &d) {
	for (int i = 1; i <= 13; i++)
		printf("% 4d", d[i]);
}

int main() {
	for (F = 1; F <= 100; F += 2) {
		reset();
		cout << F << " - " << solve() << " (" << cache.size() << ")" << endl;
		cerr << F << endl;
	}
/*
	for (pair < map<int,int>, int > tmp : cache) {
	 	print(tmp.first);
	 	cout << " -> " << tmp.second << endl;
	}
*/
	printf("Time: %.3lf\n", (double)clock() / CLOCKS_PER_SEC);

	return 0;
}