module = QUnit.module;

module("time");

(function()
{

var time = forms.util.time;

test("getLocale", function()
{
    expect(6);
    time.locales["en-GB"] = {name: "en-GB"};
    time.locales["fr"] = {name: "fr"};
    equals(time.defaultLocale, "en", "Default locale name as expected");
    equals(time.getLocale().name, "en", "Default locale retrieved without arguments");
    equals(time.getLocale("en").name, "en", "Locale retrieved by language code");
    equals(time.getLocale("en-GB").name, "en-GB", "Locale retrieved by language and region code");
    equals(time.getLocale("de").name, "en", "Unknown language code falls back to default");
    equals(time.getLocale("fr-BE").name, "fr", "Unknown language and region code falls back to language code");
});

test("strptime", function()
{
    expect(60);

    // Default date formats from django.newforms.fields
    var expected = [2006, 10, 25, 0, 0, 0, 0, 1, -1].join(",");
    equals(time.strptime("2006-10-25", "%Y-%m-%d").join(","), expected);
    equals(time.strptime("10/25/2006", "%m/%d/%Y").join(","), expected);
    equals(time.strptime("10/25/06", "%m/%d/%y").join(","), expected);
    equals(time.strptime("Oct 25 2006", "%b %d %Y").join(","), expected);
    equals(time.strptime("Oct 25, 2006", "%b %d, %Y").join(","), expected);
    equals(time.strptime("25 Oct 2006", "%d %b %Y").join(","), expected);
    equals(time.strptime("25 Oct, 2006", "%d %b, %Y").join(","), expected);
    equals(time.strptime("October 25 2006", "%B %d %Y").join(","), expected);
    equals(time.strptime("October 25, 2006", "%B %d, %Y").join(","), expected);
    equals(time.strptime("25 October 2006", "%d %B %Y").join(","), expected);
    equals(time.strptime("25 October, 2006", "%d %B, %Y").join(","), expected);

    // Spaces in patterns match multiple spaces in input
    equals(time.strptime("Oct    25    2006", "%b %d %Y").join(","), expected)
    equals(time.strptime("25   October,    2006", "%d %B, %Y").join(","), expected);

    // Default time formats from django.newforms.fields
    equals(time.strptime("14:30:59", "%H:%M:%S").join(","),
           [1900, 1, 1, 14, 30, 59, 0, 1, -1].join(","));
    equals(time.strptime("14:30", "%H:%M").join(","),
           [1900, 1, 1, 14, 30, 0, 0, 1, -1].join(","));

    // Default datetime formats from django.newforms.fields
    equals(time.strptime("2006-10-25 14:30:59", "%Y-%m-%d %H:%M:%S").join(","),
           [2006, 10, 25, 14, 30, 59, 0, 1, -1].join(","));
    equals(time.strptime("2006-10-25 14:30", "%Y-%m-%d %H:%M").join(","),
           [2006, 10, 25, 14, 30, 0, 0, 1, -1].join(","));
    equals(time.strptime("2006-10-25", "%Y-%m-%d").join(","),
           [2006, 10, 25, 0, 0, 0, 0, 1, -1].join(","));
    equals(time.strptime("10/25/2006 14:30:59", "%m/%d/%Y %H:%M:%S").join(","),
           [2006, 10, 25, 14, 30, 59, 0, 1, -1].join(","));
    equals(time.strptime("10/25/2006 14:30", "%m/%d/%Y %H:%M").join(","),
           [2006, 10, 25, 14, 30, 0, 0, 1, -1].join(","));
    equals(time.strptime("10/25/2006", "%m/%d/%Y").join(","),
           [2006, 10, 25, 0, 0, 0, 0, 1, -1].join(","));
    equals(time.strptime("10/25/06 14:30:59", "%m/%d/%y %H:%M:%S").join(","),
           [2006, 10, 25, 14, 30, 59, 0, 1, -1].join(","));
    equals(time.strptime("10/25/06 14:30", "%m/%d/%y %H:%M").join(","),
           [2006, 10, 25, 14, 30, 0, 0, 1, -1].join(","));
    equals(time.strptime("10/25/06", "%m/%d/%y").join(","),
           [2006, 10, 25, 0, 0, 0, 0, 1, -1].join(","));

    // Leap years
    equals(time.strptime("2004-02-29", "%Y-%m-%d").join(","),
           [2004, 2, 29, 0, 0, 0, 0, 1, -1].join(","),
           "Divisibile by 4, but not by 100");
    equals(time.strptime("2000-02-29", "%Y-%m-%d").join(","),
           [2000, 2, 29, 0, 0, 0, 0, 1, -1].join(","),
           "Divisibile by 400");
    errorEqual(function() { time.strptime("2200-02-29", "%Y-%m-%d"); },
               "Day is out of range: 29");

    // Boundary tests
    var months = [
        ["January", "01", "31", "32"],
        ["February", "02", "28", "29"],
        ["March", "03", "31", "32"],
        ["April", "04", "30", "31"],
        ["May", "05", "31", "32"],
        ["June", "06", "30", "31"],
        ["July", "07", "31", "32"],
        ["August", "08", "31", "32"],
        ["September", "09", "30", "31"],
        ["October", "10", "31", "32"],
        ["November", "11", "30", "31"],
        ["December", "12", "31", "32"]
    ];

    for (var i = 0, month; month = months[i]; i++)
    {
        equals(time.strptime("2006-" + month[1] + "-" + month[2], "%Y-%m-%d").join(","),
               [2006, parseInt(month[1], 10), parseInt(month[2], 10), 0, 0, 0, 0, 1, -1].join(","),
               month[0] + " has " + month[2] + " days");
        try
        {
            time.strptime("2006-" + month[1] + "-" + month[3], "%Y-%m-%d");
        }
        catch (e)
        {
            ok(true, month[0] + " only has " + month[2] + " days");
        }
    }

    var boundaries = [
        ["0", "%m", "month"],
        ["13", "%m", "month"],
        ["0", "%d", "day"],
        ["32", "%d", "day"],
        ["24", "%H", "hour"],
        ["60", "%M", "minute"],
        ["60", "%S", "second"]
    ];

    for (var i = 0, boundary; boundary = boundaries[i]; i++)
    {
        try
        {
            time.strptime(boundary[0], boundary[1]);
        }
        catch (e)
        {
            ok(true, boundary[0] + " is not a valid " + boundary[2]);
        }
    }

    // Invalid format strings
    errorEqual(function() { time.strptime("2006-10-25", "%Y-%m-%d%"); },
               "strptime format ends with raw %");
    errorEqual(function() { time.strptime("2006-10-25", "%Y-%m-%d%q"); },
               "strptime format contains an unknown directive: %q");
});

test("strpdate", function()
{
    expect(2);
    var d = time.strpdate("2006-10-25 14:30:59", "%Y-%m-%d %H:%M:%S");
    ok(d instanceof Date, "strpdate returns Date objects");
    equal(d.valueOf(), new Date(2006, 9, 25, 14, 30, 59).valueOf());
});

test("strftime", function()
{
    expect(6);

    // Default date/time format
    equals(time.strftime(new Date(2006, 9, 25, 14, 30, 59), "%Y-%m-%d %H:%M:%S"),
           "2006-10-25 14:30:59");

    // Invalid format strings
    errorEqual(function() { time.strftime(new Date(), "%Y-%m-%d %q %H:%M:%S"); },
               "strftime format contains an unknown directive: %q");
    errorEqual(function() { time.strftime(new Date(), "%Y-%m-%d %H:%M:%S%"); },
               "strftime format ends with raw %");

    equals(time.strftime(new Date(2006, 9, 25, 14, 30, 59), "%a %d %b"), "Wed 25 Oct");
    equals(time.strftime(new Date(2006, 9, 25, 14, 30, 59), "%A %d %B"), "Wednesday 25 October");
    equals(time.strftime(new Date(2006, 9, 25, 14, 30, 59), "%w"), "3");
});

})();