#include <bits/stdc++.h>
using namespace std;

const int F = 5;
int state[F + 2], m = -1;
int frf[F], f = F;


void print() {
	for (int i = 0; i < F + 2; i++)
		cout << state[i] << ' ';
	cout << endl << "Free: " << f << endl;
	for (int i = 0; i < f; i++)
		cout << frf[i] << ' ';
	cout << endl;
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

void init() {
 	for (int i = 0; i < F; i++)	
 		frf[i] = i + 1;
}

int solve(bool deb = false) {
 	if (f == 1)
 		return check();

	int res = -1000;
	for (int i = 0; i < f && res <= 0; i++) {
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
	return res;
}

int main() {
	init();
	print();
	cout << solve(true) << endl;

	return 0;
}