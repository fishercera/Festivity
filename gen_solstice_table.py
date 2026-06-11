import ephem

def get_dates_for_year(year):
    start = f"{year}/1/1"
    def to_md(d):
        dt = d.datetime()
        return [dt.month - 1, dt.day]  # 0-indexed month
    return {
        'spring': to_md(ephem.next_vernal_equinox(start)),
        'summer': to_md(ephem.next_summer_solstice(start)),
        'fall':   to_md(ephem.next_autumnal_equinox(start)),
        'winter': to_md(ephem.next_winter_solstice(start)),
    }

print("const SOLSTICE_TABLE = {")
for year in range(1990, 2076):
    d = get_dates_for_year(year)
    s, su, f, w = d['spring'], d['summer'], d['fall'], d['winter']
    print(f"  {year}: {{spring:[{s[0]},{s[1]}],summer:[{su[0]},{su[1]}],fall:[{f[0]},{f[1]}],winter:[{w[0]},{w[1]}]}},")
print("};")
