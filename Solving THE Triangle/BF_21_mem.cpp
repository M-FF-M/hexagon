#include <bits/stdc++.h>
using namespace std;

typedef long double ld;

const int MAXMEM = 1e6;
int MEMLVL1, MEMLVL2;
const int F = 21;

int state[F] = {-3, 0, -2, 0, 0, 0, 2, 0, 0, -1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0}, m = 3;
vector < int > s[F];
int frf[F], p = 0;
int v[F];
set < pair < long long, ld > > prior1, prior2;
unordered_map < ld, int > cache1, cache2;
vector < ld > vh;
int dist[F][F];
double last_time;
long long cntr1, all1, mxc;


void add(set < pair < long long, ld > > &prior, ld hash) {
	pair < long long, ld > cur = *prior.lower_bound(make_pair(-1ll, hash));
	prior.erase(cur);
	cur.first++;
	mxc = max(mxc, cur.first);
	prior.insert(cur);
	cntr1++;
}

void save(unordered_map < ld, int > &cache, set < pair < long long, ld > > &prior, ld hash, int res) {
	cache[hash] = res;
	prior.insert(make_pair(1, hash));
	if (cache.size() > 1.2 * MAXMEM) {
		int sz = cache.size();
		for ( ; sz > MAXMEM; sz--) {
			pair < long long, ld > cur = *prior.begin();
			prior.erase(cur);
			cache.erase(cur.second);
		}
	}
	all1++;
}

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
		st >> v[i];
	}
	for (int i = 0; i < F; i++)
		for (int j = 0; j < F; j++)
			dist[i][j] = (i == j ? 0 : -1);
	for (int i = 0; i < F; i++) {
	 	queue < int > q;
	 	q.push(i);
		while (!q.empty()) {
			int v = q.front();
			q.pop();
		 	for (int w : s[v]) {
		 	 	if (dist[i][w] == -1) {
		 	 	 	dist[i][w] = dist[i][v] + 1;
		 	 	 	q.push(w);
		 	 	}
		 	}
		}
	}
}

bool cmp(int i, int j) {
 	return v[frf[i]] > v[frf[j]];
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

int get_sum(int i) {
    int res = 0;
	for (int ind : s[i])
		res += state[ind];
	return res;
}

int check() {
	int i = 0;
	for ( ; i < F; i++)
		if (state[i] == 0)
			break;
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

ld vertex_hash(int v, int st) {
	vector < ld > cur;
	for (int w : s[v]) {
	 	if (dist[st][w] - 1 != dist[st][v] || state[w])
	 		continue;
		cur.push_back(log(vertex_hash(w, st)));
	}
	sort(cur.begin(), cur.end());
	ld res = 0;
	for (ld x : cur)
		res += x;
	return res + get_sum(v) + 50;
}

int solve(bool wm=false) {
/*	if (clock() - last_time > 10 * CLOCKS_PER_SEC) {
//		cout << prior1.size() << ' ' << cache1.size() << ' ' << prior1.rbegin()->first << endl;
		cout << (double)(cntr1)/(cntr1 + all1) << ' ' << mxc << endl;
	 	last_time = clock();
	}
*/
 	if (p == 1) {
 		int res = check();
 	 	return res;
 	}

 	ld cur_hash = 0;
 	if (p == MEMLVL1 || p == MEMLVL2) {
		vh.clear();
		for (int i = 0; i < F; i++) {
			if (state[i])
				continue;
			vh.push_back(vertex_hash(i, i));
		}
		sort(vh.begin(), vh.end());
		for (ld x : vh)
			cur_hash = 1.3*cur_hash + x;

		if (p == MEMLVL1 && cache1.count(cur_hash)) {
			add(prior1, cur_hash);
			return cache1[cur_hash];
		}
		if (p == MEMLVL2 && cache2.count(cur_hash)) {
			add(prior2, cur_hash);
			return cache2[cur_hash];
		}

//		print();
//		printf("%.10lf\n", (double)cur_hash);
 	}

	int res = -100, k = -1;
	/*
	int ind[F];
	for (int i = 0; i < p; i++)
		ind[i] = i;
	sort(ind, ind + p, cmp);
	*/
	for (int j = 0; j < p && (res <= 0 || wm); j++) {
		//int i = ind[j];
		int i = j;
		int x = frf[i];
	 	assert(state[x] == 0);

	 	state[x] = m;
	 	m = next(m);
	 	p--;
		swap(frf[i], frf[p]);

	 	int cur = -solve();
	 	if (cur > res)
	 		k = x;

	 	if (wm) {
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

	if (p == MEMLVL1)
		save(cache1, prior1, cur_hash, res);
	if (p == MEMLVL2)
		save(cache2, prior2, cur_hash, res);

	return res;
}

int main() {
	init();
	print();

	cout << "memoization levels: ";
	cin >> MEMLVL1 >> MEMLVL2;

	last_time = clock();
	double start = clock();
	cout << solve(true) << endl;
	cout << (clock() - start) / CLOCKS_PER_SEC << endl;

 	return 0;
}