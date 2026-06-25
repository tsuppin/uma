import re

def parse_overall_corner_passing(text: str):
    pack_lengths = []
    is_compact_scores = []
    is_elongated_scores = []

    pattern = re.compile(r'^[１-４1-4]コーナー\s+(.+)$', re.MULTILINE)
    matches = pattern.findall(text)

    if not matches:
        return {
            'overall_pack_length': 0.0,
            'overall_is_compact': 0.0,
            'overall_is_elongated': 0.0
        }

    for match in matches:
        # e.g., "8,9,3,6,2-4,7,1,5" or "(8,9),3,(6,4),(5,2,7),1"
        line = match.strip()
        # count commas to find elongatedness
        commas = line.count(',')
        # count hyphens and parentheses to find compactness
        parallels = line.count('-') + line.count('(')

        # A simplistic logic for group count
        # Number of groups separated by ',' or '-'
        # Better: split by ',' or '-' to see how many groups there are
        groups = re.split(r',|-', re.sub(r'\(|\)', '', line))
        pack_lengths.append(len(groups))

        is_compact_scores.append(1.0 if parallels >= 2 else 0.0)
        is_elongated_scores.append(1.0 if commas >= 6 and parallels == 0 else 0.0)

    return {
        'overall_pack_length': float(max(pack_lengths)) if pack_lengths else 0.0,
        'overall_is_compact': 1.0 if sum(is_compact_scores) >= 1 else 0.0,
        'overall_is_elongated': 1.0 if sum(is_elongated_scores) >= 1 else 0.0
    }

text = '''
１コーナー	8,9,3,6,2-4,7,1,5
２コーナー	8,9-3,6,2,4,(1,7),5
３コーナー	(8,9),3,(6,4),(5,2,7),1
４コーナー	8,9,(5,3),6,(4,1),7,2
'''
print(parse_overall_corner_passing(text))
