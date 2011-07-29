module = QUnit.module;

module("forms");

(function()
{

var Person = forms.Form({
  first_name: forms.CharField(),
  last_name: forms.CharField(),
  birthday: forms.DateField()
});

var PersonNew = forms.Form({
  first_name: forms.CharField({
      widget: forms.TextInput({attrs: {id: "first_name_id"}})
  }),
  last_name: forms.CharField(),
  birthday: forms.DateField()
});

test("Form", function()
{
    expect(12);
    // Pass a data object when initialising
    var p = Person({data: {first_name: "John", last_name: "Lennon", birthday: "1940-10-9"}});
    strictEqual(p.isBound, true);
    strictEqual(p.errors().isPopulated(), false);
    strictEqual(p.isValid(), true);
    strictEqual(""+p.errors().asUL(), "");
    strictEqual(p.errors().asText(), "");
    deepEqual([p.cleanedData.first_name, p.cleanedData.last_name, p.cleanedData.birthday.valueOf()],
              ["John", "Lennon", new Date(1940, 9, 9).valueOf()]);
    equal(""+p.boundField("first_name"),
           "<input type=\"text\" name=\"first_name\" id=\"id_first_name\" value=\"John\">");
    equal(""+p.boundField("last_name"),
           "<input type=\"text\" name=\"last_name\" id=\"id_last_name\" value=\"Lennon\">");
    equal(""+p.boundField("birthday"),
           "<input type=\"text\" name=\"birthday\" id=\"id_birthday\" value=\"1940-10-9\">");
    try { p.boundField("nonexistentfield"); } catch (e) { equals(e.message, "Form does not have a 'nonexistentfield' field."); }

    var formOutput = [], boundFields = p.boundFields();
    for (var i = 0, boundField; boundField = boundFields[i]; i++)
        formOutput.push([boundField.label, boundField.data()]);
    deepEqual(formOutput, [
        ['First name', 'John'],
        ['Last name', 'Lennon'],
        ['Birthday', '1940-10-9']
    ]);

    equal(""+p,
"<tr><th><label for=\"id_first_name\">First name:</label></th><td><input type=\"text\" name=\"first_name\" id=\"id_first_name\" value=\"John\"></td></tr>\n" +
"<tr><th><label for=\"id_last_name\">Last name:</label></th><td><input type=\"text\" name=\"last_name\" id=\"id_last_name\" value=\"Lennon\"></td></tr>\n" +
"<tr><th><label for=\"id_birthday\">Birthday:</label></th><td><input type=\"text\" name=\"birthday\" id=\"id_birthday\" value=\"1940-10-9\"></td></tr>");

});

test("Empty data object", function()
{
    expect(10);
    // Empty objects are valid, too
    var p = Person({data: {}});
    strictEqual(p.isBound, true);
    deepEqual(p.errors("first_name").errors, ["This field is required."]);
    deepEqual(p.errors("last_name").errors, ["This field is required."]);
    deepEqual(p.errors("birthday").errors, ["This field is required."]);
    deepEqual(p.isValid(), false);
    equal(typeof p.cleanedData, "undefined");
    equal(""+p,
"<tr><th><label for=\"id_first_name\">First name:</label></th><td><ul class=\"errorlist\"><li>This field is required.</li></ul><input type=\"text\" name=\"first_name\" id=\"id_first_name\"></td></tr>\n" +
"<tr><th><label for=\"id_last_name\">Last name:</label></th><td><ul class=\"errorlist\"><li>This field is required.</li></ul><input type=\"text\" name=\"last_name\" id=\"id_last_name\"></td></tr>\n" +
"<tr><th><label for=\"id_birthday\">Birthday:</label></th><td><ul class=\"errorlist\"><li>This field is required.</li></ul><input type=\"text\" name=\"birthday\" id=\"id_birthday\"></td></tr>");
    equal(p.asTable(),
"<tr><th><label for=\"id_first_name\">First name:</label></th><td><ul class=\"errorlist\"><li>This field is required.</li></ul><input type=\"text\" name=\"first_name\" id=\"id_first_name\"></td></tr>\n" +
"<tr><th><label for=\"id_last_name\">Last name:</label></th><td><ul class=\"errorlist\"><li>This field is required.</li></ul><input type=\"text\" name=\"last_name\" id=\"id_last_name\"></td></tr>\n" +
"<tr><th><label for=\"id_birthday\">Birthday:</label></th><td><ul class=\"errorlist\"><li>This field is required.</li></ul><input type=\"text\" name=\"birthday\" id=\"id_birthday\"></td></tr>");
    equal(p.asUL(),
"<li><ul class=\"errorlist\"><li>This field is required.</li></ul><label for=\"id_first_name\">First name:</label> <input type=\"text\" name=\"first_name\" id=\"id_first_name\"></li>\n" +
"<li><ul class=\"errorlist\"><li>This field is required.</li></ul><label for=\"id_last_name\">Last name:</label> <input type=\"text\" name=\"last_name\" id=\"id_last_name\"></li>\n" +
"<li><ul class=\"errorlist\"><li>This field is required.</li></ul><label for=\"id_birthday\">Birthday:</label> <input type=\"text\" name=\"birthday\" id=\"id_birthday\"></li>");
    equal(p.asP(),
"<ul class=\"errorlist\"><li>This field is required.</li></ul>\n" +
"<p><label for=\"id_first_name\">First name:</label> <input type=\"text\" name=\"first_name\" id=\"id_first_name\"></p>\n" +
"<ul class=\"errorlist\"><li>This field is required.</li></ul>\n" +
"<p><label for=\"id_last_name\">Last name:</label> <input type=\"text\" name=\"last_name\" id=\"id_last_name\"></p>\n" +
"<ul class=\"errorlist\"><li>This field is required.</li></ul>\n" +
"<p><label for=\"id_birthday\">Birthday:</label> <input type=\"text\" name=\"birthday\" id=\"id_birthday\"></p>");
});

test("Unbound form", function()
{
    expect(8);
    // If you don't pass any "data" values, or if you pass null, the Form will
    // be considered unbound and won't do any validation. Form.errors will be
    // empty *but* Form.isValid() will return False.
    var p = Person();
    strictEqual(p.isBound, false);
    strictEqual(p.errors().isPopulated(), false);
    strictEqual(p.isValid(), false);
    equal(typeof p.cleanedData, "undefined");
    equal(""+p,
"<tr><th><label for=\"id_first_name\">First name:</label></th><td><input type=\"text\" name=\"first_name\" id=\"id_first_name\"></td></tr>\n" +
"<tr><th><label for=\"id_last_name\">Last name:</label></th><td><input type=\"text\" name=\"last_name\" id=\"id_last_name\"></td></tr>\n" +
"<tr><th><label for=\"id_birthday\">Birthday:</label></th><td><input type=\"text\" name=\"birthday\" id=\"id_birthday\"></td></tr>");
    equal(p.asTable(),
"<tr><th><label for=\"id_first_name\">First name:</label></th><td><input type=\"text\" name=\"first_name\" id=\"id_first_name\"></td></tr>\n" +
"<tr><th><label for=\"id_last_name\">Last name:</label></th><td><input type=\"text\" name=\"last_name\" id=\"id_last_name\"></td></tr>\n" +
"<tr><th><label for=\"id_birthday\">Birthday:</label></th><td><input type=\"text\" name=\"birthday\" id=\"id_birthday\"></td></tr>");
    equal(p.asUL(),
"<li><label for=\"id_first_name\">First name:</label> <input type=\"text\" name=\"first_name\" id=\"id_first_name\"></li>\n" +
"<li><label for=\"id_last_name\">Last name:</label> <input type=\"text\" name=\"last_name\" id=\"id_last_name\"></li>\n" +
"<li><label for=\"id_birthday\">Birthday:</label> <input type=\"text\" name=\"birthday\" id=\"id_birthday\"></li>");
    equal(p.asP(),
"<p><label for=\"id_first_name\">First name:</label> <input type=\"text\" name=\"first_name\" id=\"id_first_name\"></p>\n" +
"<p><label for=\"id_last_name\">Last name:</label> <input type=\"text\" name=\"last_name\" id=\"id_last_name\"></p>\n" +
"<p><label for=\"id_birthday\">Birthday:</label> <input type=\"text\" name=\"birthday\" id=\"id_birthday\"></p>");
});

test("Validation errors", function()
{
    expect(12);
    var p = Person({data: {last_name: "Lennon"}});
    deepEqual(p.errors("first_name").errors, ["This field is required."]);
    deepEqual(p.errors("birthday").errors, ["This field is required."]);
    deepEqual(p.isValid(), false);
    equal(""+p.errors().asUL(),
           "<ul class=\"errorlist\"><li>first_name<ul class=\"errorlist\"><li>This field is required.</li></ul></li><li>birthday<ul class=\"errorlist\"><li>This field is required.</li></ul></li></ul>");
    equal(p.errors().asText(),
"* first_name\n" +
"  * This field is required.\n" +
"* birthday\n" +
"  * This field is required.");
    equal(typeof p.cleanedData, "undefined");
    deepEqual(p.boundField("first_name").errors().errors, ["This field is required."]);
    equal(""+p.boundField("first_name").errors().asUL(),
           "<ul class=\"errorlist\"><li>This field is required.</li></ul>");
    equal(""+p.boundField("first_name").errors().asText(),
           "* This field is required.");

    p = Person();
    equal(""+p.boundField("first_name"),
           "<input type=\"text\" name=\"first_name\" id=\"id_first_name\">");
    equal(""+p.boundField("last_name"),
           "<input type=\"text\" name=\"last_name\" id=\"id_last_name\">");
    equal(""+p.boundField("birthday"),
           "<input type=\"text\" name=\"birthday\" id=\"id_birthday\">");
});

test("cleanedData only fields", function()
{
    expect(6);
    // cleanedData will always *only* contain properties for fields defined in
    // the Form, even if you pass extra data when you define the Form. In this
    // example, we pass a bunch of extra fields to the form constructor, but
    // cleanedData contains only the form's fields.
    var data = {first_name: "John", last_name: "Lennon", birthday: "1940-10-9", extra1: "hello", extra2: "hello"};
    var p = Person({data: data});
    strictEqual(p.isValid(), true);
    equal(p.cleanedData.first_name, "John");
    equal(p.cleanedData.last_name, "Lennon");
    equal(p.cleanedData.birthday.valueOf(), new Date(1940, 9, 9).valueOf());
    equal(typeof p.cleanedData.extra1, "undefined");
    equal(typeof p.cleanedData.extra2, "undefined");
});

test("Optional data", function()
{
    expect(8);
    // cleanedData will include a key and value for *all* fields defined in the
    // Form, even if the Form's data didn't include a value for fields that are
    // not required. In this example, the data object doesn't include a value
    // for the "nick_name" field, but cleanedData includes it. For CharFields,
    // it's set to the empty String.
    var OptionalPersonForm = forms.Form({
      first_name: forms.CharField(),
      last_name: forms.CharField(),
      nick_name: forms.CharField({required: false})
    });
    var data = {first_name: "John", last_name: "Lennon"};
    var f = OptionalPersonForm({data: data});
    strictEqual(f.isValid(), true);
    strictEqual(f.cleanedData.nick_name, "");
    equal(f.cleanedData.first_name, "John");
    equal(f.cleanedData.last_name, "Lennon");

    // For DateFields, it's set to null
    OptionalPersonForm = forms.Form({
      first_name: forms.CharField(),
      last_name: forms.CharField(),
      birth_date: forms.DateField({required: false})
    });
    data = {first_name: "John", last_name: "Lennon"};
    f = OptionalPersonForm({data: data});
    strictEqual(f.isValid(), true);
    strictEqual(f.cleanedData.birth_date, null);
    equal(f.cleanedData.first_name, "John");
    equal(f.cleanedData.last_name, "Lennon");
});

test("autoId", function()
{
    expect(3);
    // "autoId" tells the Form to add an "id" attribute to each form element.
    // If it's a string that contains "%(name)s", newforms will use that as a
    // format string into which the field's name will be inserted. It will also
    // put a <label> around the human-readable labels for a field.
    var p = Person({autoId: "%(name)s_id"});
    equal(p.asTable(),
"<tr><th><label for=\"first_name_id\">First name:</label></th><td><input type=\"text\" name=\"first_name\" id=\"first_name_id\"></td></tr>\n" +
"<tr><th><label for=\"last_name_id\">Last name:</label></th><td><input type=\"text\" name=\"last_name\" id=\"last_name_id\"></td></tr>\n" +
"<tr><th><label for=\"birthday_id\">Birthday:</label></th><td><input type=\"text\" name=\"birthday\" id=\"birthday_id\"></td></tr>");
    equal(p.asUL(),
"<li><label for=\"first_name_id\">First name:</label> <input type=\"text\" name=\"first_name\" id=\"first_name_id\"></li>\n" +
"<li><label for=\"last_name_id\">Last name:</label> <input type=\"text\" name=\"last_name\" id=\"last_name_id\"></li>\n" +
"<li><label for=\"birthday_id\">Birthday:</label> <input type=\"text\" name=\"birthday\" id=\"birthday_id\"></li>");
    equal(p.asP(),
"<p><label for=\"first_name_id\">First name:</label> <input type=\"text\" name=\"first_name\" id=\"first_name_id\"></p>\n" +
"<p><label for=\"last_name_id\">Last name:</label> <input type=\"text\" name=\"last_name\" id=\"last_name_id\"></p>\n" +
"<p><label for=\"birthday_id\">Birthday:</label> <input type=\"text\" name=\"birthday\" id=\"birthday_id\"></p>");
});

test("autoId true", function()
{
    expect(1);
    // If autoId is any truthy value whose string representation does not
    // contain "%(name)s", the "id" attribute will be the name of the field.
    var p = Person({autoId: true});
    equal(p.asUL(),
"<li><label for=\"first_name\">First name:</label> <input type=\"text\" name=\"first_name\" id=\"first_name\"></li>\n" +
"<li><label for=\"last_name\">Last name:</label> <input type=\"text\" name=\"last_name\" id=\"last_name\"></li>\n" +
"<li><label for=\"birthday\">Birthday:</label> <input type=\"text\" name=\"birthday\" id=\"birthday\"></li>");
});

test("autoId false", function()
{
    expect(1);
    // If autoId is any falsy value, an "id" attribute won't be output unless it
    // was manually entered.
    var p = Person({autoId: false});
    equal(p.asUL(),
"<li>First name: <input type=\"text\" name=\"first_name\"></li>\n" +
"<li>Last name: <input type=\"text\" name=\"last_name\"></li>\n" +
"<li>Birthday: <input type=\"text\" name=\"birthday\"></li>");
});

test("id on field", function()
{
    expect(1);
    // In this example, autoId is false, but the "id" attribute for the
    // "first_name" field is given. Also note that field gets a <label>, while
    // the others don't.
    var p = PersonNew({autoId: false});
    equal(p.asUL(),
"<li><label for=\"first_name_id\">First name:</label> <input id=\"first_name_id\" type=\"text\" name=\"first_name\"></li>\n" +
"<li>Last name: <input type=\"text\" name=\"last_name\"></li>\n" +
"<li>Birthday: <input type=\"text\" name=\"birthday\"></li>");
});

test("autoId on form and field", function()
{
    expect(1);
    // If the "id" attribute is specified in the Form and autoId is true, the
    // "id" attribute in the Form gets precedence.
    var p = PersonNew({autoId: true});
    equal(p.asUL(),
"<li><label for=\"first_name_id\">First name:</label> <input id=\"first_name_id\" type=\"text\" name=\"first_name\"></li>\n" +
"<li><label for=\"last_name\">Last name:</label> <input type=\"text\" name=\"last_name\" id=\"last_name\"></li>\n" +
"<li><label for=\"birthday\">Birthday:</label> <input type=\"text\" name=\"birthday\" id=\"birthday\"></li>");
});

test("Various boolean values", function()
{
    expect(8);
    var SignupForm = forms.Form({
      email: forms.EmailField(),
      get_spam: forms.BooleanField()
    });
    var f = SignupForm({autoId: false});
    equal(""+f.boundField("email"),
           "<input type=\"text\" name=\"email\">");
    equal(""+f.boundField("get_spam"),
           "<input type=\"checkbox\" name=\"get_spam\">");

    f = SignupForm({data: {email: "test@example.com", get_spam: true}, autoId: false});
    equal(""+f.boundField("email"),
           "<input type=\"text\" name=\"email\" value=\"test@example.com\">");
    equal(""+f.boundField("get_spam"),
           "<input type=\"checkbox\" name=\"get_spam\" checked=\"checked\">");

    // Values of "true" or "True" should be rendered without a value
    f = SignupForm({data: {email: "test@example.com", get_spam: "true"}, autoId: false});
    equal(""+f.boundField("get_spam"),
           "<input type=\"checkbox\" name=\"get_spam\" checked=\"checked\">");

    f = SignupForm({data: {email: "test@example.com", get_spam: "True"}, autoId: false});
    equal(""+f.boundField("get_spam"),
           "<input type=\"checkbox\" name=\"get_spam\" checked=\"checked\">");

    // Values of "false" or "False" should render unchecked
    f = SignupForm({data: {email: "test@example.com", get_spam: "false"}, autoId: false});
    equal(""+f.boundField("get_spam"),
           "<input type=\"checkbox\" name=\"get_spam\">");

    f = SignupForm({data: {email: "test@example.com", get_spam: "False"}, autoId: false});
    equal(""+f.boundField("get_spam"),
           "<input type=\"checkbox\" name=\"get_spam\">");
});

test("Widget output", function()
{
    expect(10);
    // Any Field can have a Widget constructor passed to its constructor
    var ContactForm = forms.Form({
      subject: forms.CharField(),
      message: forms.CharField({widget: forms.Textarea})
    });
    var f = ContactForm({autoId: false});
    equal(""+f.boundField("subject"),
           "<input type=\"text\" name=\"subject\">");
    equal(""+f.boundField("message"),
           "<textarea rows=\"10\" cols=\"40\" name=\"message\"></textarea>");

    // asTextarea(), asText() and asHidden() are shortcuts for changing the
    // output widget type
    equal(""+f.boundField("subject").asText(),
           "<input type=\"text\" name=\"subject\">");
    equal(""+f.boundField("subject").asTextarea(),
           "<textarea rows=\"10\" cols=\"40\" name=\"subject\"></textarea>");
    equal(""+f.boundField("subject").asHidden(),
           "<input type=\"hidden\" name=\"subject\">");

    //The "widget" parameter to a Field can also be an instance
    var ContactForm = forms.Form({
      subject: forms.CharField(),
      message: forms.CharField({
          widget: forms.Textarea({attrs: {rows: 80, cols: 20}})
      })
    });
    f = ContactForm({autoId: false});
    equal(""+f.boundField("message"),
           "<textarea rows=\"80\" cols=\"20\" name=\"message\"></textarea>");

    // Instance-level attrs are *not* carried over to asTextarea(), asText() and
    // asHidden()
    equal(""+f.boundField("message").asText(),
           "<input type=\"text\" name=\"message\">");
    f = ContactForm({data: {subject: "Hello", message: "I love you."}, autoId: false});
    equal(""+f.boundField("subject").asTextarea(),
           "<textarea rows=\"10\" cols=\"40\" name=\"subject\">Hello</textarea>");
    equal(""+f.boundField("message").asText(),
           "<input type=\"text\" name=\"message\" value=\"I love you.\">");
    equal(""+f.boundField("message").asHidden(),
           "<input type=\"hidden\" name=\"message\" value=\"I love you.\">");
});

test("Forms with choices", function()
{
    expect(9);
    // For a form with a <select>, use ChoiceField
    var FrameworkForm = forms.Form({
      name: forms.CharField(),
      language: forms.ChoiceField({choices: [["P", "Python"], ["J", "Java"]]})
    });
    var f = FrameworkForm({autoId: false});
    equal(""+f.boundField("language"),
"<select name=\"language\">\n" +
"<option value=\"P\">Python</option>\n" +
"<option value=\"J\">Java</option>\n" +
"</select>");
    f = FrameworkForm({data: {name: "Django", language: "P"}, autoId: false});
    equal(""+f.boundField("language"),
"<select name=\"language\">\n" +
"<option value=\"P\" selected=\"selected\">Python</option>\n" +
"<option value=\"J\">Java</option>\n" +
"</select>");

    // A subtlety: If one of the choices' value is the empty string and the form
    // is unbound, then the <option> for the empty-string choice will get
    // selected="selected".
    FrameworkForm = forms.Form({
      name: forms.CharField(),
      language: forms.ChoiceField({choices: [["", "------"],["P", "Python"], ["J", "Java"]]})
    });
    f = FrameworkForm({autoId: false});
    equal(""+f.boundField("language"),
"<select name=\"language\">\n" +
"<option value=\"\" selected=\"selected\">------</option>\n" +
"<option value=\"P\">Python</option>\n" +
"<option value=\"J\">Java</option>\n" +
"</select>");

    // You can specify widget attributes in the Widget constructor
    FrameworkForm = forms.Form({
      name: forms.CharField(),
      language: forms.ChoiceField({
          choices: [["P", "Python"], ["J", "Java"]],
          widget: forms.Select({attrs: {"class": "foo"}})
      })
    });
    f = FrameworkForm({autoId: false});
    equal(""+f.boundField("language"),
"<select class=\"foo\" name=\"language\">\n" +
"<option value=\"P\">Python</option>\n" +
"<option value=\"J\">Java</option>\n" +
"</select>");
    f = FrameworkForm({data: {name: "Django", language: "P"}, autoId: false});
    equal(""+f.boundField("language"),
"<select class=\"foo\" name=\"language\">\n" +
"<option value=\"P\" selected=\"selected\">Python</option>\n" +
"<option value=\"J\">Java</option>\n" +
"</select>");

    // When passing a custom widget instance to ChoiceField, note that setting
    // "choices" on the widget is meaningless. The widget will use the choices
    // defined on the Field, not the ones defined on the Widget.
    FrameworkForm = forms.Form({
      name: forms.CharField(),
      language: forms.ChoiceField({
          choices: [["P", "Python"], ["J", "Java"]],
          widget: forms.Select({
              choices: [["R", "Ruby"], ["P", "Perl"]],
              attrs: {"class": "foo"}
          })
      })
    });
    f = FrameworkForm({autoId: false});
    equal(""+f.boundField("language"),
"<select class=\"foo\" name=\"language\">\n" +
"<option value=\"P\">Python</option>\n" +
"<option value=\"J\">Java</option>\n" +
"</select>");
    f = FrameworkForm({data: {name: "Django", language: "P"}, autoId: false});
    equal(""+f.boundField("language"),
"<select class=\"foo\" name=\"language\">\n" +
"<option value=\"P\" selected=\"selected\">Python</option>\n" +
"<option value=\"J\">Java</option>\n" +
"</select>");

    // You can set a ChoiceField's choices after the fact
    FrameworkForm = forms.Form({
      name: forms.CharField(),
      language: forms.ChoiceField()
    });
    f = FrameworkForm({autoId: false});
    equal(""+f.boundField("language"),
"<select name=\"language\">\n" +
"</select>");
    f.fields["language"].setChoices([["P", "Python"], ["J", "Java"]]);
    equal(""+f.boundField("language"),
"<select name=\"language\">\n" +
"<option value=\"P\">Python</option>\n" +
"<option value=\"J\">Java</option>\n" +
"</select>");
});

test("Forms with radio", function()
{
    expect(7);
    // Add {widget: RadioSelect} to use that widget with a ChoiceField
    var FrameworkForm = forms.Form({
      name: forms.CharField(),
      language: forms.ChoiceField({choices: [["P", "Python"], ["J", "Java"]], widget: forms.RadioSelect})
    });
    var f = FrameworkForm({autoId: false});
    equal(""+f.boundField("language"),
"<ul>\n" +
"<li><label><input type=\"radio\" name=\"language\" value=\"P\"> Python</label></li>\n" +
"<li><label><input type=\"radio\" name=\"language\" value=\"J\"> Java</label></li>\n" +
"</ul>");
    equal(""+f,
"<tr><th>Name:</th><td><input type=\"text\" name=\"name\"></td></tr>\n" +
"<tr><th>Language:</th><td><ul>\n" +
"<li><label><input type=\"radio\" name=\"language\" value=\"P\"> Python</label></li>\n" +
"<li><label><input type=\"radio\" name=\"language\" value=\"J\"> Java</label></li>\n" +
"</ul></td></tr>");
    equal(""+f.asUL(),
"<li>Name: <input type=\"text\" name=\"name\"></li>\n" +
"<li>Language: <ul>\n" +
"<li><label><input type=\"radio\" name=\"language\" value=\"P\"> Python</label></li>\n" +
"<li><label><input type=\"radio\" name=\"language\" value=\"J\"> Java</label></li>\n" +
"</ul></li>");

    // Regarding autoId and <label>, RadioSelect is a special case. Each radio
    // button gets a distinct ID, formed by appending an underscore plus the
    // button's zero-based index.
    f = FrameworkForm({autoId: "id_%(name)s"});
    equal(""+f.boundField("language"),
"<ul>\n" +
"<li><label for=\"id_language_0\"><input id=\"id_language_0\" type=\"radio\" name=\"language\" value=\"P\"> Python</label></li>\n" +
"<li><label for=\"id_language_1\"><input id=\"id_language_1\" type=\"radio\" name=\"language\" value=\"J\"> Java</label></li>\n" +
"</ul>");

    // When RadioSelect is used with autoId, and the whole form is printed using
    // either asTable() or asUl(), the label for the RadioSelect will point to the
    // ID of the *first* radio button.
    equal(""+f,
"<tr><th><label for=\"id_name\">Name:</label></th><td><input type=\"text\" name=\"name\" id=\"id_name\"></td></tr>\n" +
"<tr><th><label for=\"id_language_0\">Language:</label></th><td><ul>\n" +
"<li><label for=\"id_language_0\"><input id=\"id_language_0\" type=\"radio\" name=\"language\" value=\"P\"> Python</label></li>\n" +
"<li><label for=\"id_language_1\"><input id=\"id_language_1\" type=\"radio\" name=\"language\" value=\"J\"> Java</label></li>\n" +
"</ul></td></tr>");
    equal(""+f.asUL(),
"<li><label for=\"id_name\">Name:</label> <input type=\"text\" name=\"name\" id=\"id_name\"></li>\n" +
"<li><label for=\"id_language_0\">Language:</label> <ul>\n" +
"<li><label for=\"id_language_0\"><input id=\"id_language_0\" type=\"radio\" name=\"language\" value=\"P\"> Python</label></li>\n" +
"<li><label for=\"id_language_1\"><input id=\"id_language_1\" type=\"radio\" name=\"language\" value=\"J\"> Java</label></li>\n" +
"</ul></li>");
    equal(""+f.asP(),
"<p><label for=\"id_name\">Name:</label> <input type=\"text\" name=\"name\" id=\"id_name\"></p>\n" +
"<p><label for=\"id_language_0\">Language:</label> <ul>\n" +
"<li><label for=\"id_language_0\"><input id=\"id_language_0\" type=\"radio\" name=\"language\" value=\"P\"> Python</label></li>\n" +
"<li><label for=\"id_language_1\"><input id=\"id_language_1\" type=\"radio\" name=\"language\" value=\"J\"> Java</label></li>\n" +
"</ul></p>");
});

test("Forms with multiple choice", function()
{
    expect(4);
    // MultipleChoiceField is a special case, as its data is required to be a
    // list.
    var SongForm = forms.Form({
      name: forms.CharField(),
      composers: forms.MultipleChoiceField()
    });
    var f = SongForm({autoId: false});
    equal(""+f.boundField("composers"),
"<select name=\"composers\" multiple=\"multiple\">\n" +
"</select>")
    SongForm = forms.Form({
      name: forms.CharField(),
      composers: forms.MultipleChoiceField({choices: [["J", "John Lennon"], ["P", "Paul McCartney"]]})
    });
    f = SongForm({autoId: false});
    equal(""+f.boundField("composers"),
"<select name=\"composers\" multiple=\"multiple\">\n" +
"<option value=\"J\">John Lennon</option>\n" +
"<option value=\"P\">Paul McCartney</option>\n" +
"</select>")
    f = SongForm({data: {name: "Yesterday", composers: ["P"]}, autoId: false});
    equal(""+f.boundField("name"),
"<input type=\"text\" name=\"name\" value=\"Yesterday\">");
    equal(""+f.boundField("composers"),
"<select name=\"composers\" multiple=\"multiple\">\n" +
"<option value=\"J\">John Lennon</option>\n" +
"<option value=\"P\" selected=\"selected\">Paul McCartney</option>\n" +
"</select>")
});

test("Hidden data", function()
{
    expect(5);
    var SongForm = forms.Form({
      name: forms.CharField(),
      composers: forms.MultipleChoiceField({choices: [["J", "John Lennon"], ["P", "Paul McCartney"]]})
    });

    // MultipleChoiceField rendered asHidden() is a special case. Because it can
    // have multiple values, its asHidden() renders multiple
    // <input type="hidden"> tags.
    var f = SongForm({data: {name: "Yesterday", composers: ["P"]}, autoId: false});
    equal(""+f.boundField("composers").asHidden(),
"<input type=\"hidden\" name=\"composers\" value=\"P\">");
    f = SongForm({data: {name: "Yesterday", composers: ["P", "J"]}, autoId: false});
    equal(""+f.boundField("composers").asHidden(),
"<input type=\"hidden\" name=\"composers\" value=\"P\"><input type=\"hidden\" name=\"composers\" value=\"J\">");

    // DateTimeField rendered asHidden() is special too
    var MessageForm = forms.Form({
      when: forms.SplitDateTimeField()
    });
    f = MessageForm({data: {when_0: "1992-01-01", when_1: "01:01"}});
    strictEqual(f.isValid(), true);
    equal(""+f.boundField("when"),
"<input type=\"text\" name=\"when_0\" id=\"id_when_0\" value=\"1992-01-01\"><input type=\"text\" name=\"when_1\" id=\"id_when_1\" value=\"01:01\">");
    equal(""+f.boundField("when").asHidden(),
"<input type=\"hidden\" name=\"when_0\" id=\"id_when_0\" value=\"1992-01-01\"><input type=\"hidden\" name=\"when_1\" id=\"id_when_1\" value=\"01:01\">");
});

test("Mutiple choice checkbox", function()
{
    expect(3);
    // MultipleChoiceField can also be used with the CheckboxSelectMultiple
    // widget.
    var SongForm = forms.Form({
      name: forms.CharField(),
      composers: forms.MultipleChoiceField({choices: [["J", "John Lennon"], ["P", "Paul McCartney"]], widget: forms.CheckboxSelectMultiple})
    });
    var f = SongForm({autoId: false});
    equal(""+f.boundField("composers"),
"<ul>\n" +
"<li><label><input type=\"checkbox\" name=\"composers\" value=\"J\"> John Lennon</label></li>\n" +
"<li><label><input type=\"checkbox\" name=\"composers\" value=\"P\"> Paul McCartney</label></li>\n" +
"</ul>");
    f = SongForm({data: {composers: ["J"]}, autoId: false});
    equal(""+f.boundField("composers"),
"<ul>\n" +
"<li><label><input type=\"checkbox\" name=\"composers\" value=\"J\" checked=\"checked\"> John Lennon</label></li>\n" +
"<li><label><input type=\"checkbox\" name=\"composers\" value=\"P\"> Paul McCartney</label></li>\n" +
"</ul>");
    f = SongForm({data: {composers: ["J", "P"]}, autoId: false});
    equal(""+f.boundField("composers"),
"<ul>\n" +
"<li><label><input type=\"checkbox\" name=\"composers\" value=\"J\" checked=\"checked\"> John Lennon</label></li>\n" +
"<li><label><input type=\"checkbox\" name=\"composers\" value=\"P\" checked=\"checked\"> Paul McCartney</label></li>\n" +
"</ul>");
});

test("Checkbox autoId", function()
{
    expect(1);
    var SongForm = forms.Form({
      name: forms.CharField(),
      composers: forms.MultipleChoiceField({choices: [["J", "John Lennon"], ["P", "Paul McCartney"]], widget: forms.CheckboxSelectMultiple})
    });
    // Regarding autoId, CheckboxSelectMultiple is another special case. Each
    // checkbox gets a distinct ID, formed by appending an underscore plus the
    // checkbox's zero-based index.
    var f = SongForm({autoId: "%(name)s_id"});
    equal(""+f.boundField("composers"),
"<ul>\n" +
"<li><label for=\"composers_id_0\"><input id=\"composers_id_0\" type=\"checkbox\" name=\"composers\" value=\"J\"> John Lennon</label></li>\n" +
"<li><label for=\"composers_id_1\"><input id=\"composers_id_1\" type=\"checkbox\" name=\"composers\" value=\"P\"> Paul McCartney</label></li>\n" +
"</ul>");
});

test("Multiple choice list data", function()
{
    expect(2);
    var SongForm = forms.Form({
      name: forms.CharField(),
      composers: forms.MultipleChoiceField({choices: [["J", "John Lennon"], ["P", "Paul McCartney"]], widget: forms.CheckboxSelectMultiple})
    });

    var data = {name: "Yesterday", composers: ["J", "P"]};
    var f = SongForm(data);
    equal(f.errors().isPopulated(), false);

    // This also happens to work with Strings if choice values are single
    // characters.
    var data = {name: "Yesterday", composers: "JP"};
    var f = SongForm(data);
    equal(f.errors().isPopulated(), false);
});

test("Multiple hidden", function()
{
    expect(8);
    var SongForm = forms.Form({
      name: forms.CharField(),
      composers: forms.MultipleChoiceField({choices: [["J", "John Lennon"], ["P", "Paul McCartney"]], widget: forms.CheckboxSelectMultiple})
    });

    // The MultipleHiddenInput widget renders multiple values as hidden fields
    var SongFormHidden = forms.Form({
      name: forms.CharField(),
      composers: forms.MultipleChoiceField({choices: [["J", "John Lennon"], ["P", "Paul McCartney"]], widget: forms.MultipleHiddenInput})
    });

    var f = SongFormHidden({data: {name: "Yesterday", composers: ["J", "P"]}, autoId: false});
    equal(""+f.asUL(),
"<li>Name: <input type=\"text\" name=\"name\" value=\"Yesterday\"><input type=\"hidden\" name=\"composers\" value=\"J\"><input type=\"hidden\" name=\"composers\" value=\"P\"></li>");

    // When using MultipleChoiceField, the framework expects a list of input and
    // returns a list of input.
    f = SongForm({data: {name: "Yesterday"}, autoId: false});
    deepEqual(f.errors("composers").errors, ["This field is required."]);
    f = SongForm({data: {name: "Yesterday", composers: ["J"]}, autoId: false});
    strictEqual(f.errors().isPopulated(), false);
    deepEqual(f.cleanedData["composers"], ["J"]);
    equal(f.cleanedData["name"], "Yesterday");
    f = SongForm({data: {name: "Yesterday", composers: ["J", "P"]}, autoId: false});
    strictEqual(f.errors().isPopulated(), false);
    deepEqual(f.cleanedData["composers"], ["J", "P"]);
    equal(f.cleanedData["name"], "Yesterday");
});

test("Escaping", function()
{
    expect(2);
    // Validation errors are HTML-escaped when output as HTML
    var EscapingForm = forms.Form({
      specialName: forms.CharField({label: "<em>Special</em> Field"}),
      specialSafeName: forms.CharField({label: DOMBuilder.html.markSafe("<em>Special</em> Field")}),

      cleanSpecialName: function() {
          throw forms.ValidationError("Something's wrong with '" + this.cleanedData.specialName + "'");
      },
      cleanSpecialSafeName: function() {
          throw forms.ValidationError(
              DOMBuilder.html.markSafe(
                  "'<b>" + this.cleanedData.specialSafeName + "</b>' is a safe string"));
      }
    });
    var f = EscapingForm({data: {specialName: "Nothing to escape", specialSafeName: "Nothing to escape"}, autoId: false});
    equal(""+f,
"<tr><th>&lt;em&gt;Special&lt;/em&gt; Field:</th><td><ul class=\"errorlist\"><li>Something&#39;s wrong with &#39;Nothing to escape&#39;</li></ul><input type=\"text\" name=\"specialName\" value=\"Nothing to escape\"></td></tr>\n" +
"<tr><th><em>Special</em> Field:</th><td><ul class=\"errorlist\"><li>'<b>Nothing to escape</b>' is a safe string</li></ul><input type=\"text\" name=\"specialSafeName\" value=\"Nothing to escape\"></td></tr>");
    f = EscapingForm({
        data: {
            specialName: "Should escape < & > and <script>alert('xss')</script>",
            specialSafeName: "<i>Do not escape error message</i>"
        },
        autoId: false
    });
    equal(""+f,
"<tr><th>&lt;em&gt;Special&lt;/em&gt; Field:</th><td><ul class=\"errorlist\"><li>Something&#39;s wrong with &#39;Should escape &lt; &amp; &gt; and &lt;script&gt;alert(&#39;xss&#39;)&lt;/script&gt;&#39;</li></ul><input type=\"text\" name=\"specialName\" value=\"Should escape &lt; &amp; &gt; and &lt;script&gt;alert(&#39;xss&#39;)&lt;/script&gt;\"></td></tr>\n" +
"<tr><th><em>Special</em> Field:</th><td><ul class=\"errorlist\"><li>'<b><i>Do not escape error message</i></b>' is a safe string</li></ul><input type=\"text\" name=\"specialSafeName\" value=\"&lt;i&gt;Do not escape error message&lt;/i&gt;\"></td></tr>");
});

test("Validating multiple fields", function()
{
    expect(20);
    // There are a couple of ways to do multiple-field validation. If you want
    // the validation message to be associated with a particular field,
    // implement the clean_XXX() method on the Form, where XXX is the field
    // name. As in Field.clean(), the clean_XXX() method should return the
    // cleaned value. In the clean_XXX() method, you have access to
    // this.cleanedData, which is an object containing all the data that has
    // been cleaned *so far*, in order by the fields, including the current
    // field (e.g., the field XXX if you're in clean_XXX()).
    var UserRegistration = forms.Form({
      username: forms.CharField({maxLength: 10}),
      password1: forms.CharField({widget: forms.PasswordInput}),
      password2: forms.CharField({widget: forms.PasswordInput}),

      clean_password2: function() {
          if (this.cleanedData.password1 != this.cleanedData.password2)
              throw forms.ValidationError("Please make sure your passwords match.");
          return this.cleanedData.password2;
      }
    });
    var f = UserRegistration({autoId: false});
    strictEqual(f.errors().isPopulated(), false);
    f = UserRegistration({data: {}, autoId: false});
    deepEqual(f.errors("username").errors, ["This field is required."]);
    deepEqual(f.errors("password1").errors, ["This field is required."]);
    deepEqual(f.errors("password2").errors, ["This field is required."]);
    f = UserRegistration({data: {username: "adrian", password1: "foo", password2: "bar"}, autoId: false});
    deepEqual(f.errors("password2").errors, ["Please make sure your passwords match."]);
    f = UserRegistration({data: {username: "adrian", password1: "foo", password2: "foo"}, autoId: false});
    strictEqual(f.errors().isPopulated(), false);
    equal(f.cleanedData.username, "adrian");
    equal(f.cleanedData.password1, "foo");
    equal(f.cleanedData.password2, "foo");

    // Another way of doing multiple-field validation is by implementing the
    // Form's clean() method. If you do this, any ValidationError raised by that
    // method will not be associated with a particular field; it will have a
    // special-case association with the field named '__all__'.
    // Note that in Form.clean(), you have access to self.cleanedData, an object
    // containing all the fields/values that have *not* raised a
    // ValidationError. Also note Form.clean() is required to return a
    // dictionary of all clean data.
    UserRegistration = forms.Form({
      username: forms.CharField({maxLength: 10}),
      password1: forms.CharField({widget: forms.PasswordInput}),
      password2: forms.CharField({widget: forms.PasswordInput}),

      clean: function() {
          if (this.cleanedData.password1 && this.cleanedData.password2 &&
              this.cleanedData.password1 != this.cleanedData.password2)
              throw forms.ValidationError("Please make sure your passwords match.");
          return this.cleanedData;
      }
    });
    f = UserRegistration({data: {}, autoId: false});
    equal(f.asTable(),
"<tr><th>Username:</th><td><ul class=\"errorlist\"><li>This field is required.</li></ul><input maxlength=\"10\" type=\"text\" name=\"username\"></td></tr>\n" +
"<tr><th>Password1:</th><td><ul class=\"errorlist\"><li>This field is required.</li></ul><input type=\"password\" name=\"password1\"></td></tr>\n" +
"<tr><th>Password2:</th><td><ul class=\"errorlist\"><li>This field is required.</li></ul><input type=\"password\" name=\"password2\"></td></tr>")
    deepEqual(f.errors("username").errors, ["This field is required."]);
    deepEqual(f.errors("password1").errors, ["This field is required."]);
    deepEqual(f.errors("password2").errors, ["This field is required."]);
    f = UserRegistration({data: {username: "adrian", password1: "foo", password2: "bar"}, autoId: false});
    deepEqual(f.errors("__all__").errors, ["Please make sure your passwords match."]);
    equal(f.asTable(),
"<tr><td colspan=\"2\"><ul class=\"errorlist\"><li>Please make sure your passwords match.</li></ul></td></tr>\n" +
"<tr><th>Username:</th><td><input maxlength=\"10\" type=\"text\" name=\"username\" value=\"adrian\"></td></tr>\n" +
"<tr><th>Password1:</th><td><input type=\"password\" name=\"password1\"></td></tr>\n" +
"<tr><th>Password2:</th><td><input type=\"password\" name=\"password2\"></td></tr>");
    equal(f.asUL(),
"<li><ul class=\"errorlist\"><li>Please make sure your passwords match.</li></ul></li>\n" +
"<li>Username: <input maxlength=\"10\" type=\"text\" name=\"username\" value=\"adrian\"></li>\n" +
"<li>Password1: <input type=\"password\" name=\"password1\"></li>\n" +
"<li>Password2: <input type=\"password\" name=\"password2\"></li>");
    f = UserRegistration({data: {username: "adrian", password1: "foo", password2: "foo"}, autoId: false});
    strictEqual(f.errors().isPopulated(), false);
    equal(f.cleanedData.username, "adrian");
    equal(f.cleanedData.password1, "foo");
    equal(f.cleanedData.password2, "foo");
});

test("Dynamic construction", function()
{
    expect(17);
    // It's possible to construct a Form dynamically by adding to this.fields
    // during construction. Don't forget to initialise any parent constructors
    // first. Form provides a postInit() hook suitable for this purpose.
    var Person = forms.Form({
      first_name: forms.CharField(),
      last_name: forms.CharField(),

      postInit: function(kwargs) {
          this.fields["birthday"] = forms.DateField();
      }
    });
    var p = Person({autoId: false});
    equal(""+p,
"<tr><th>First name:</th><td><input type=\"text\" name=\"first_name\"></td></tr>\n" +
"<tr><th>Last name:</th><td><input type=\"text\" name=\"last_name\"></td></tr>\n" +
"<tr><th>Birthday:</th><td><input type=\"text\" name=\"birthday\"></td></tr>");

    // Instances of a dynamic Form do not persist fields from one Form instance to
    // the next.
    var MyForm = forms.Form({
      preInit: function(kwargs) {
          return forms.util.extend({
              data: null, autoId: false, fieldList: []
          }, kwargs || {});
      },
      postInit: function(kwargs) {
          for (var i = 0, l = kwargs.fieldList.length; i < l; i++) {
              this.fields[kwargs.fieldList[i][0]] = kwargs.fieldList[i][1];
          }
      }
    });
    var fieldList = [["field1", forms.CharField()], ["field2", forms.CharField()]];
    var myForm = MyForm({fieldList: fieldList});
    equal(""+myForm,
"<tr><th>Field1:</th><td><input type=\"text\" name=\"field1\"></td></tr>\n" +
"<tr><th>Field2:</th><td><input type=\"text\" name=\"field2\"></td></tr>");
    fieldList = [["field3", forms.CharField()], ["field4", forms.CharField()]];
    myForm = MyForm({fieldList: fieldList});
    equal(""+myForm,
"<tr><th>Field3:</th><td><input type=\"text\" name=\"field3\"></td></tr>\n" +
"<tr><th>Field4:</th><td><input type=\"text\" name=\"field4\"></td></tr>");

    MyForm = forms.Form({
      default_field_1: forms.CharField(),
      default_field_2: forms.CharField(),

      preInit: function(kwargs) {
          return forms.util.extend({
              data: null, autoId: false, fieldList: []
          }, kwargs || {});
      },
      postInit: function(kwargs) {
          for (var i = 0, l = kwargs.fieldList.length; i < l; i++) {
              this.fields[kwargs.fieldList[i][0]] = kwargs.fieldList[i][1];
          }
      }
    });
    fieldList = [["field1", forms.CharField()], ["field2", forms.CharField()]];
    myForm = MyForm({fieldList: fieldList});
    equal(""+myForm,
"<tr><th>Default field 1:</th><td><input type=\"text\" name=\"default_field_1\"></td></tr>\n" +
"<tr><th>Default field 2:</th><td><input type=\"text\" name=\"default_field_2\"></td></tr>\n" +
"<tr><th>Field1:</th><td><input type=\"text\" name=\"field1\"></td></tr>\n" +
"<tr><th>Field2:</th><td><input type=\"text\" name=\"field2\"></td></tr>");
    fieldList = [["field3", forms.CharField()], ["field4", forms.CharField()]];
    myForm = MyForm({fieldList: fieldList});
    equal(""+myForm,
"<tr><th>Default field 1:</th><td><input type=\"text\" name=\"default_field_1\"></td></tr>\n" +
"<tr><th>Default field 2:</th><td><input type=\"text\" name=\"default_field_2\"></td></tr>\n" +
"<tr><th>Field3:</th><td><input type=\"text\" name=\"field3\"></td></tr>\n" +
"<tr><th>Field4:</th><td><input type=\"text\" name=\"field4\"></td></tr>");

    // Similarly, changes to field attributes do not persist from one Form
    // instance to the next.
    Person = forms.Form({
      first_name: forms.CharField({required: false}),
      last_name: forms.CharField({required: false}),

      preInit: function(kwargs) {
          return forms.util.extend({namesRequired: false}, kwargs || {});
      },
      postInit: function(kwargs) {
          if (kwargs.namesRequired) {
              this.fields["first_name"].required = true;
              this.fields["first_name"].widget.attrs["class"] = "required";
              this.fields["last_name"].required = true;
              this.fields["last_name"].widget.attrs["class"] = "required";
          }
      }
    });
    var f = Person({namesRequired: false});
    deepEqual([f.boundField("first_name").field.required, f.boundField("last_name").field.required],
         [false, false]);
    deepEqual([f.boundField("first_name").field.widget.attrs, f.boundField("last_name").field.widget.attrs],
         [{}, {}]);
    f = Person({namesRequired: true});
    deepEqual([f.boundField("first_name").field.required, f.boundField("last_name").field.required],
         [true, true]);
    deepEqual([f.boundField("first_name").field.widget.attrs, f.boundField("last_name").field.widget.attrs],
         [{"class": "required"}, {"class": "required"}]);
    f = Person({namesRequired: false});
    deepEqual([f.boundField("first_name").field.required, f.boundField("last_name").field.required],
         [false, false]);
    deepEqual([f.boundField("first_name").field.widget.attrs, f.boundField("last_name").field.widget.attrs],
         [{}, {}]);

    Person = forms.Form({
      first_name: forms.CharField({maxLength: 30}),
      last_name: forms.CharField({maxLength: 30}),

      preInit: function(kwargs) {
          return forms.util.extend({nameMaxLength: null}, kwargs || {});
      },
      postInit: function(kwargs) {
          if (kwargs.nameMaxLength) {
              this.fields["first_name"].maxLength = kwargs.nameMaxLength;
              this.fields["last_name"].maxLength = kwargs.nameMaxLength;
          }
      }
    });
    f = Person({nameMaxLength: null});
    deepEqual([f.boundField("first_name").field.maxLength, f.boundField("last_name").field.maxLength],
         [30, 30]);
    f = Person({nameMaxLength: 20});
    deepEqual([f.boundField("first_name").field.maxLength, f.boundField("last_name").field.maxLength],
         [20, 20]);
    f = Person({nameMaxLength: null});
    deepEqual([f.boundField("first_name").field.maxLength, f.boundField("last_name").field.maxLength],
         [30, 30]);

    // Similarly, choices do not persist from one Form instance to the next
    Person = forms.Form({
      first_name: forms.CharField({maxLength: 30}),
      last_name: forms.CharField({maxLength: 30}),
      gender: forms.ChoiceField({choices: [['f', 'Female'], ['m', 'Male']]}),

      preInit: function(kwargs) {
          return forms.util.extend({allowUnspecGender: false}, kwargs || {});
      },
      postInit: function(kwargs) {
          if (kwargs.allowUnspecGender) {
              var f = this.fields["gender"]
              f.setChoices(f.choices().concat([['u', 'Unspecified']]))
          }
      }
    });
    f = Person();
    deepEqual(f.boundField("gender").field.choices(),
              [['f', 'Female'], ['m', 'Male']]);
    f = Person({allowUnspecGender: true});
    deepEqual(f.boundField("gender").field.choices(),
              [['f', 'Female'], ['m', 'Male'], ['u', 'Unspecified']]);
    f = Person();
    deepEqual(f.boundField("gender").field.choices(),
              [['f', 'Female'], ['m', 'Male']]);
});

test("Hidden widget", function()
{
    expect(12);
    // HiddenInput widgets are displayed differently in the asTable(), asUL()
    // and asP() output of a Form - their verbose names are not displayed, and a
    // separate row is not displayed. They're displayed in the last row of the
    // form, directly after that row's form element.
    var Person = forms.Form({
      first_name: forms.CharField(),
      last_name: forms.CharField(),
      hidden_text: forms.CharField({widget: forms.HiddenInput}),
      birthday: forms.DateField()
    });
    var p = Person({autoId: false});
    equal(""+p,
"<tr><th>First name:</th><td><input type=\"text\" name=\"first_name\"></td></tr>\n" +
"<tr><th>Last name:</th><td><input type=\"text\" name=\"last_name\"></td></tr>\n" +
"<tr><th>Birthday:</th><td><input type=\"text\" name=\"birthday\"><input type=\"hidden\" name=\"hidden_text\"></td></tr>");
    equal(p.asUL(),
"<li>First name: <input type=\"text\" name=\"first_name\"></li>\n" +
"<li>Last name: <input type=\"text\" name=\"last_name\"></li>\n" +
"<li>Birthday: <input type=\"text\" name=\"birthday\"><input type=\"hidden\" name=\"hidden_text\"></li>");
    equal(p.asP(),
"<p>First name: <input type=\"text\" name=\"first_name\"></p>\n" +
"<p>Last name: <input type=\"text\" name=\"last_name\"></p>\n" +
"<p>Birthday: <input type=\"text\" name=\"birthday\"><input type=\"hidden\" name=\"hidden_text\"></p>");

    // With autoId set, a HiddenInput still gets an id, but it doesn't get a label.
    p = Person({autoId: "id_%(name)s"});
    equal(""+p,
"<tr><th><label for=\"id_first_name\">First name:</label></th><td><input type=\"text\" name=\"first_name\" id=\"id_first_name\"></td></tr>\n" +
"<tr><th><label for=\"id_last_name\">Last name:</label></th><td><input type=\"text\" name=\"last_name\" id=\"id_last_name\"></td></tr>\n" +
"<tr><th><label for=\"id_birthday\">Birthday:</label></th><td><input type=\"text\" name=\"birthday\" id=\"id_birthday\"><input type=\"hidden\" name=\"hidden_text\" id=\"id_hidden_text\"></td></tr>");
    equal(""+p.asUL(),
"<li><label for=\"id_first_name\">First name:</label> <input type=\"text\" name=\"first_name\" id=\"id_first_name\"></li>\n" +
"<li><label for=\"id_last_name\">Last name:</label> <input type=\"text\" name=\"last_name\" id=\"id_last_name\"></li>\n" +
"<li><label for=\"id_birthday\">Birthday:</label> <input type=\"text\" name=\"birthday\" id=\"id_birthday\"><input type=\"hidden\" name=\"hidden_text\" id=\"id_hidden_text\"></li>");
    equal(""+p.asP(),
"<p><label for=\"id_first_name\">First name:</label> <input type=\"text\" name=\"first_name\" id=\"id_first_name\"></p>\n" +
"<p><label for=\"id_last_name\">Last name:</label> <input type=\"text\" name=\"last_name\" id=\"id_last_name\"></p>\n" +
"<p><label for=\"id_birthday\">Birthday:</label> <input type=\"text\" name=\"birthday\" id=\"id_birthday\"><input type=\"hidden\" name=\"hidden_text\" id=\"id_hidden_text\"></p>");

    // If a field with a HiddenInput has errors, the asTable(), asUl() and asP()
    // output will include the error message(s) with the text
    // "(Hidden field [fieldname]) " prepended. This message is displayed at the
    // top of the output, regardless of its field's order in the form.
    p = Person({data: {first_name: "John", last_name: "Lennon", birthday: "1940-10-9"}, autoId: false});
    equal(""+p,
"<tr><td colspan=\"2\"><ul class=\"errorlist\"><li>(Hidden field hidden_text) This field is required.</li></ul></td></tr>\n" +
"<tr><th>First name:</th><td><input type=\"text\" name=\"first_name\" value=\"John\"></td></tr>\n" +
"<tr><th>Last name:</th><td><input type=\"text\" name=\"last_name\" value=\"Lennon\"></td></tr>\n" +
"<tr><th>Birthday:</th><td><input type=\"text\" name=\"birthday\" value=\"1940-10-9\"><input type=\"hidden\" name=\"hidden_text\"></td></tr>");
    equal(""+p.asUL(),
"<li><ul class=\"errorlist\"><li>(Hidden field hidden_text) This field is required.</li></ul></li>\n" +
"<li>First name: <input type=\"text\" name=\"first_name\" value=\"John\"></li>\n" +
"<li>Last name: <input type=\"text\" name=\"last_name\" value=\"Lennon\"></li>\n" +
"<li>Birthday: <input type=\"text\" name=\"birthday\" value=\"1940-10-9\"><input type=\"hidden\" name=\"hidden_text\"></li>");
    equal(""+p.asP(),
"<ul class=\"errorlist\"><li>(Hidden field hidden_text) This field is required.</li></ul>\n" +
"<p>First name: <input type=\"text\" name=\"first_name\" value=\"John\"></p>\n" +
"<p>Last name: <input type=\"text\" name=\"last_name\" value=\"Lennon\"></p>\n" +
"<p>Birthday: <input type=\"text\" name=\"birthday\" value=\"1940-10-9\"><input type=\"hidden\" name=\"hidden_text\"></p>");

    // A corner case: It's possible for a form to have only HiddenInputs. Since
    // we expect that the content of asTable() and asUL() will be held in
    // appropriate HTML elements within the document and we don't want to end up
    // with invalid HTML, a row will be created to contain the hidden fields. In
    // the case of asP(), form inputs must reside inside a block-level container
    // to qualify as valid HTML, so the inputs will be wrapped in a <div> in
    // this scenario.
    var TestForm = forms.Form({
      foo: forms.CharField({widget: forms.HiddenInput}),
      bar: forms.CharField({widget: forms.HiddenInput})
    });
    p = TestForm({autoId: false});
    equal(""+p.asTable(),
"<tr><td colspan=\"2\"><input type=\"hidden\" name=\"foo\"><input type=\"hidden\" name=\"bar\"></td></tr>");
    equal(""+p.asUL(),
"<li><input type=\"hidden\" name=\"foo\"><input type=\"hidden\" name=\"bar\"></li>");
    equal(""+p.asP(),
"<div><input type=\"hidden\" name=\"foo\"><input type=\"hidden\" name=\"bar\"></div>");
});

test("Field order", function()
{
    expect(1);
    // A Form's fields are displayed in the same order they were defined
    var TestForm = forms.Form({
      field1: forms.CharField(),
      field2: forms.CharField(),
      field3: forms.CharField(),
      field4: forms.CharField(),
      field5: forms.CharField(),
      field6: forms.CharField(),
      field7: forms.CharField(),
      field8: forms.CharField(),
      field9: forms.CharField(),
      field10: forms.CharField(),
      field11: forms.CharField(),
      field12: forms.CharField(),
      field13: forms.CharField(),
      field14: forms.CharField()
    });
    var p = TestForm({autoId: false});
    equal(""+p,
"<tr><th>Field1:</th><td><input type=\"text\" name=\"field1\"></td></tr>\n" +
"<tr><th>Field2:</th><td><input type=\"text\" name=\"field2\"></td></tr>\n" +
"<tr><th>Field3:</th><td><input type=\"text\" name=\"field3\"></td></tr>\n" +
"<tr><th>Field4:</th><td><input type=\"text\" name=\"field4\"></td></tr>\n" +
"<tr><th>Field5:</th><td><input type=\"text\" name=\"field5\"></td></tr>\n" +
"<tr><th>Field6:</th><td><input type=\"text\" name=\"field6\"></td></tr>\n" +
"<tr><th>Field7:</th><td><input type=\"text\" name=\"field7\"></td></tr>\n" +
"<tr><th>Field8:</th><td><input type=\"text\" name=\"field8\"></td></tr>\n" +
"<tr><th>Field9:</th><td><input type=\"text\" name=\"field9\"></td></tr>\n" +
"<tr><th>Field10:</th><td><input type=\"text\" name=\"field10\"></td></tr>\n" +
"<tr><th>Field11:</th><td><input type=\"text\" name=\"field11\"></td></tr>\n" +
"<tr><th>Field12:</th><td><input type=\"text\" name=\"field12\"></td></tr>\n" +
"<tr><th>Field13:</th><td><input type=\"text\" name=\"field13\"></td></tr>\n" +
"<tr><th>Field14:</th><td><input type=\"text\" name=\"field14\"></td></tr>");
});

test("Form HTML attributes", function()
{
    expect(2);
    // Some Field classes have an effect on the HTML attributes of their
    // associated Widget. If you set maxLength in a CharField and its associated
    // widget is either a TextInput or PasswordInput, then the widget's rendered
    // HTML will include the "maxlength" attribute.
    var UserRegistration = forms.Form({
      username: forms.CharField({maxLength: 10}), // Uses forms.TextInput by default
      password: forms.CharField({maxLength: 10, widget: forms.PasswordInput}),
      realname: forms.CharField({maxLength: 10, widget: forms.TextInput}), // Redundantly degine widget, just to test
      address: forms.CharField()
    });
    var p = UserRegistration({autoId: false});
    equal(""+p.asUL(),
"<li>Username: <input maxlength=\"10\" type=\"text\" name=\"username\"></li>\n" +
"<li>Password: <input maxlength=\"10\" type=\"password\" name=\"password\"></li>\n" +
"<li>Realname: <input maxlength=\"10\" type=\"text\" name=\"realname\"></li>\n" +
"<li>Address: <input type=\"text\" name=\"address\"></li>");

    // If you specify a custom "attrs" that includes the "maxlength" attribute,
    // the Field's maxLength attribute will override whatever "maxlength" you
    // specify in "attrs".
    UserRegistration = forms.Form({
      username: forms.CharField({maxLength: 10, widget: forms.TextInput({attrs: {maxlength: 20}})}),
      password: forms.CharField({maxLength: 10, widget: forms.PasswordInput})
    });
    p = UserRegistration({autoId: false});
    equal(""+p.asUL(),
"<li>Username: <input maxlength=\"10\" type=\"text\" name=\"username\"></li>\n" +
"<li>Password: <input maxlength=\"10\" type=\"password\" name=\"password\"></li>");
});

test("Specifying labels", function()
{
    expect(6);
    // You can specify the label for a field by using the "label" argument to a
    // Field class. If you don't specify 'label', newforms will use the field
    // name with underscores converted to spaces, and the initial letter
    // capitalised.
    var UserRegistration = forms.Form({
      username: forms.CharField({maxLength: 10, label: "Your username"}),
      password1: forms.CharField({widget: forms.PasswordInput}),
      password2: forms.CharField({widget: forms.PasswordInput, label: "Password (again)"})
    });
    var p = UserRegistration({autoId: false});
    equal(""+p.asUL(),
"<li>Your username: <input maxlength=\"10\" type=\"text\" name=\"username\"></li>\n" +
"<li>Password1: <input type=\"password\" name=\"password1\"></li>\n" +
"<li>Password (again): <input type=\"password\" name=\"password2\"></li>");

    // Labels for as* methods will only end in a colon if they don't end in
    // other punctuation already.
    var Questions = forms.Form({
      q1: forms.CharField({label: "The first question"}),
      q2: forms.CharField({label: "What is your name?"}),
      q3: forms.CharField({label: "The answer to life is:"}),
      q4: forms.CharField({label: "Answer this question!"}),
      q5: forms.CharField({label: "The last question. Period."})
    });
    p = Questions({autoId: false});
    equal(""+p.asP(),
"<p>The first question: <input type=\"text\" name=\"q1\"></p>\n" +
"<p>What is your name? <input type=\"text\" name=\"q2\"></p>\n" +
"<p>The answer to life is: <input type=\"text\" name=\"q3\"></p>\n" +
"<p>Answer this question! <input type=\"text\" name=\"q4\"></p>\n" +
"<p>The last question. Period. <input type=\"text\" name=\"q5\"></p>");

    // If a label is set to the empty string for a field, that field won't get a
    // label.
    UserRegistration = forms.Form({
      username: forms.CharField({maxLength: 10, label: ""}),
      password1: forms.CharField({widget: forms.PasswordInput})
    });
    p = UserRegistration({autoId: false});
    equal(""+p.asUL(),
"<li> <input maxlength=\"10\" type=\"text\" name=\"username\"></li>\n" +
"<li>Password1: <input type=\"password\" name=\"password1\"></li>");
    p = UserRegistration({autoId: "id_%(name)s"});
    equal(""+p.asUL(),
"<li> <input maxlength=\"10\" type=\"text\" name=\"username\" id=\"id_username\"></li>\n" +
"<li><label for=\"id_password1\">Password1:</label> <input type=\"password\" name=\"password1\" id=\"id_password1\"></li>");

    // If label is null, newforms will auto-create the label from the field
    // name. This is the default behavior.
    UserRegistration = forms.Form({
      username: forms.CharField({maxLength: 10, label: null}),
      password1: forms.CharField({widget: forms.PasswordInput})
    });
    p = UserRegistration({autoId: false});
    equal(""+p.asUL(),
"<li>Username: <input maxlength=\"10\" type=\"text\" name=\"username\"></li>\n" +
"<li>Password1: <input type=\"password\" name=\"password1\"></li>");
    p = UserRegistration({autoId: "id_%(name)s"});
    equal(""+p.asUL(),
"<li><label for=\"id_username\">Username:</label> <input maxlength=\"10\" type=\"text\" name=\"username\" id=\"id_username\"></li>\n" +
"<li><label for=\"id_password1\">Password1:</label> <input type=\"password\" name=\"password1\" id=\"id_password1\"></li>");
});

test("Label suffix", function()
{
    expect(4);
    // You can specify the "labelSuffix" argument to a Form class to modify the
    // punctuation symbol used at the end of a label.  By default, the colon
    // (:) is used, and is only appended to the label if the label doesn't
    // already end with a punctuation symbol: ., !, ? or :.
    var FavouriteForm = forms.Form({
      colour: forms.CharField({label: "Favourite colour?"}),
      animal: forms.CharField({label: "Favourite animal"})
    });
    var f = FavouriteForm({autoId: false});
    equal(""+f.asUL(),
"<li>Favourite colour? <input type=\"text\" name=\"colour\"></li>\n" +
"<li>Favourite animal: <input type=\"text\" name=\"animal\"></li>");
    f = FavouriteForm({autoId: false, labelSuffix: "?"});
    equal(""+f.asUL(),
"<li>Favourite colour? <input type=\"text\" name=\"colour\"></li>\n" +
"<li>Favourite animal? <input type=\"text\" name=\"animal\"></li>");
    f = FavouriteForm({autoId: false, labelSuffix: ""});
    equal(""+f.asUL(),
"<li>Favourite colour? <input type=\"text\" name=\"colour\"></li>\n" +
"<li>Favourite animal <input type=\"text\" name=\"animal\"></li>");
    f = FavouriteForm({autoId: false, labelSuffix: "\u2192"});
    equal(""+f.asUL(),
"<li>Favourite colour? <input type=\"text\" name=\"colour\"></li>\n" +
"<li>Favourite animal\u2192 <input type=\"text\" name=\"animal\"></li>");
});

test("Initial data", function()
{
    expect(6);
    // You can specify initial data for a field by using the "initial" argument
    // to a Field class. This initial data is displayed when a Form is rendered
    // with *no* data. It is not displayed when a Form is rendered with any data
    // (including an empty object). Also, the initial value is *not* used if
    // data for a particular required field isn't provided.
    var UserRegistration = forms.Form({
      username: forms.CharField({maxLength: 10, initial: "django"}),
      password: forms.CharField({widget: forms.PasswordInput})
    });

    // Here, we're not submitting any data, so the initial value will be
    // displayed.
    var p = UserRegistration({autoId: false});
    equal(""+p.asUL(),
"<li>Username: <input maxlength=\"10\" type=\"text\" name=\"username\" value=\"django\"></li>\n" +
"<li>Password: <input type=\"password\" name=\"password\"></li>");

    // Here, we're submitting data, so the initial value will *not* be displayed.
    p = UserRegistration({data: {}, autoId: false});
    equal(""+p.asUL(),
"<li><ul class=\"errorlist\"><li>This field is required.</li></ul>Username: <input maxlength=\"10\" type=\"text\" name=\"username\"></li>\n" +
"<li><ul class=\"errorlist\"><li>This field is required.</li></ul>Password: <input type=\"password\" name=\"password\"></li>");
    p = UserRegistration({data: {username: ""}, autoId: false});
    equal(""+p.asUL(),
"<li><ul class=\"errorlist\"><li>This field is required.</li></ul>Username: <input maxlength=\"10\" type=\"text\" name=\"username\"></li>\n" +
"<li><ul class=\"errorlist\"><li>This field is required.</li></ul>Password: <input type=\"password\" name=\"password\"></li>");
    p = UserRegistration({data: {username: "foo"}, autoId: false});
    equal(""+p.asUL(),
"<li>Username: <input maxlength=\"10\" type=\"text\" name=\"username\" value=\"foo\"></li>\n" +
"<li><ul class=\"errorlist\"><li>This field is required.</li></ul>Password: <input type=\"password\" name=\"password\"></li>");

    // An "initial" value is *not* used as a fallback if data is not provided.
    // In this example, we don't provide a value for "username", and the form
    // raises a validation error rather than using the initial value for
    // "username".
    p = UserRegistration({data: {password: "secret"}});
    deepEqual(p.errors("username").errors, ["This field is required."]);
    strictEqual(p.isValid(), false);
});

test("Dynamic initial data", function()
{
    expect(8);
    // The previous technique dealt with "hard-coded" initial data, but it's
    // also possible to specify initial data after you've already created the
    // Form class (i.e., at runtime). Use the "initial" parameter to the Form
    // constructor. This should be an object containing initial values for one
    // or more fields in the form, keyed by field name.
    var UserRegistration = forms.Form({
      username: forms.CharField({maxLength: 10}),
      password: forms.CharField({widget: forms.PasswordInput})
    });

    // Here, we're not submitting any data, so the initial value will be displayed.
    var p = UserRegistration({initial: {username: "django"}, autoId: false});
    equal(""+p.asUL(),
"<li>Username: <input maxlength=\"10\" type=\"text\" name=\"username\" value=\"django\"></li>\n" +
"<li>Password: <input type=\"password\" name=\"password\"></li>");
    p = UserRegistration({initial: {username: "stephane"}, autoId: false});
    equal(""+p.asUL(),
"<li>Username: <input maxlength=\"10\" type=\"text\" name=\"username\" value=\"stephane\"></li>\n" +
"<li>Password: <input type=\"password\" name=\"password\"></li>");

    // The "initial" parameter is meaningless if you pass data
    p = UserRegistration({data: {}, initial: {username: "django"}, autoId: false});
    equal(""+p.asUL(),
"<li><ul class=\"errorlist\"><li>This field is required.</li></ul>Username: <input maxlength=\"10\" type=\"text\" name=\"username\"></li>\n" +
"<li><ul class=\"errorlist\"><li>This field is required.</li></ul>Password: <input type=\"password\" name=\"password\"></li>");
    p = UserRegistration({data: {username: ""}, initial: {username: "django"}, autoId: false});
    equal(""+p.asUL(),
"<li><ul class=\"errorlist\"><li>This field is required.</li></ul>Username: <input maxlength=\"10\" type=\"text\" name=\"username\"></li>\n" +
"<li><ul class=\"errorlist\"><li>This field is required.</li></ul>Password: <input type=\"password\" name=\"password\"></li>");
    p = UserRegistration({data: {username: "foo"}, initial: {username: "django"}, autoId: false});
    equal(""+p.asUL(),
"<li>Username: <input maxlength=\"10\" type=\"text\" name=\"username\" value=\"foo\"></li>\n" +
"<li><ul class=\"errorlist\"><li>This field is required.</li></ul>Password: <input type=\"password\" name=\"password\"></li>");

    // A dynamic "initial" value is *not* used as a fallback if data is not
    // provided. In this example, we don't provide a value for "username", and
    // the form raises a validation error rather than using the initial value
    // for "username".
    p = UserRegistration({data: {password: "secret"}, initial: {username: "django"}});
    deepEqual(p.errors("username").errors, ["This field is required."]);
    strictEqual(p.isValid(), false);

    // If a Form defines "initial" *and* "initial" is passed as a parameter
    // during construction, then the latter will get precedence.
    UserRegistration = forms.Form({
      username: forms.CharField({maxLength: 10, initial: "django"}),
      password: forms.CharField({widget: forms.PasswordInput})
    });
    p = UserRegistration({initial: {username: "babik"}, autoId: false});
    equal(""+p.asUL(),
"<li>Username: <input maxlength=\"10\" type=\"text\" name=\"username\" value=\"babik\"></li>\n" +
"<li>Password: <input type=\"password\" name=\"password\"></li>");
});

test("Callable initial data", function()
{
    expect(8);
    // The previous technique dealt with raw values as initial data, but it's
    // also possible to specify callable data.
    var UserRegistration = forms.Form({
      username: forms.CharField({maxLength: 10}),
      password: forms.CharField({widget: forms.PasswordInput}),
      options: forms.MultipleChoiceField({choices: [["f", "foo"], ["b", "bar"], ["w", "whiz"]]})
    });

    // We need to define functions that get called later
    function initialDjango() { return "django"; }
    function initialStephane() { return "stephane"; }
    function initialOptions() { return ["f", "b"]; }
    function initialOtherOptions() { return ["b", "w"]; }

    // Here, we're not submitting any data, so the initial value will be
    // displayed.
    var p = UserRegistration({initial: {username: initialDjango, options: initialOptions}, autoId: false});
    equal(""+p.asUL(),
"<li>Username: <input maxlength=\"10\" type=\"text\" name=\"username\" value=\"django\"></li>\n" +
"<li>Password: <input type=\"password\" name=\"password\"></li>\n" +
"<li>Options: <select name=\"options\" multiple=\"multiple\">\n" +
"<option value=\"f\" selected=\"selected\">foo</option>\n" +
"<option value=\"b\" selected=\"selected\">bar</option>\n" +
"<option value=\"w\">whiz</option>\n" +
"</select></li>");

    // The "initial" parameter is meaningless if you pass data.
    p = UserRegistration({data: {}, initial: {username: initialDjango, options: initialOptions}, autoId: false});
    equal(""+p.asUL(),
"<li><ul class=\"errorlist\"><li>This field is required.</li></ul>Username: <input maxlength=\"10\" type=\"text\" name=\"username\"></li>\n" +
"<li><ul class=\"errorlist\"><li>This field is required.</li></ul>Password: <input type=\"password\" name=\"password\"></li>\n" +
"<li><ul class=\"errorlist\"><li>This field is required.</li></ul>Options: <select name=\"options\" multiple=\"multiple\">\n" +
"<option value=\"f\">foo</option>\n" +
"<option value=\"b\">bar</option>\n" +
"<option value=\"w\">whiz</option>\n" +
"</select></li>");
    p = UserRegistration({data: {username: ""}, initial: {username: initialDjango}, autoId: false});
    equal(""+p.asUL(),
"<li><ul class=\"errorlist\"><li>This field is required.</li></ul>Username: <input maxlength=\"10\" type=\"text\" name=\"username\"></li>\n" +
"<li><ul class=\"errorlist\"><li>This field is required.</li></ul>Password: <input type=\"password\" name=\"password\"></li>\n" +
"<li><ul class=\"errorlist\"><li>This field is required.</li></ul>Options: <select name=\"options\" multiple=\"multiple\">\n" +
"<option value=\"f\">foo</option>\n" +
"<option value=\"b\">bar</option>\n" +
"<option value=\"w\">whiz</option>\n" +
"</select></li>");
    p = UserRegistration({data: {username: "foo", options: ["f", "b"]}, initial: {username: initialDjango}, autoId: false});
    equal(""+p.asUL(),
"<li>Username: <input maxlength=\"10\" type=\"text\" name=\"username\" value=\"foo\"></li>\n" +
"<li><ul class=\"errorlist\"><li>This field is required.</li></ul>Password: <input type=\"password\" name=\"password\"></li>\n" +
"<li>Options: <select name=\"options\" multiple=\"multiple\">\n" +
"<option value=\"f\" selected=\"selected\">foo</option>\n" +
"<option value=\"b\" selected=\"selected\">bar</option>\n" +
"<option value=\"w\">whiz</option>\n" +
"</select></li>");

    // A callable 'initial' value is *not* used as a fallback if data is not
    // provided. In this example, we don't provide a value for 'username', and
    // the form raises a validation error rather than using the initial value
    // for 'username'.
    p = UserRegistration({data: {password: "secret"}, initial: {username: initialDjango, options: initialOptions}});
    deepEqual(p.errors("username").errors, ["This field is required."]);
    strictEqual(p.isValid(), false);

    // If a Form defines "initial" *and* "initial" is passed as a parameter
    // during construction, then the latter will get precedence.
    UserRegistration = forms.Form({
      username: forms.CharField({maxLength: 10, initial: initialDjango}),
      password: forms.CharField({widget: forms.PasswordInput}),
      options: forms.MultipleChoiceField({choices: [["f", "foo"], ["b", "bar"], ["w", "whiz"]], initial: initialOtherOptions})
    });
    p = UserRegistration({autoId: false});
    equal(""+p.asUL(),
"<li>Username: <input maxlength=\"10\" type=\"text\" name=\"username\" value=\"django\"></li>\n" +
"<li>Password: <input type=\"password\" name=\"password\"></li>\n" +
"<li>Options: <select name=\"options\" multiple=\"multiple\">\n" +
"<option value=\"f\">foo</option>\n" +
"<option value=\"b\" selected=\"selected\">bar</option>\n" +
"<option value=\"w\" selected=\"selected\">whiz</option>\n" +
"</select></li>");
    p = UserRegistration({initial: {username: initialStephane, options: initialOptions}, autoId: false});
    equal(""+p.asUL(),
"<li>Username: <input maxlength=\"10\" type=\"text\" name=\"username\" value=\"stephane\"></li>\n" +
"<li>Password: <input type=\"password\" name=\"password\"></li>\n" +
"<li>Options: <select name=\"options\" multiple=\"multiple\">\n" +
"<option value=\"f\" selected=\"selected\">foo</option>\n" +
"<option value=\"b\" selected=\"selected\">bar</option>\n" +
"<option value=\"w\">whiz</option>\n" +
"</select></li>");
});

test("Boundfield values", function()
{
    expect(4);
    // It's possible to get to the value which would be used for rendering
    // the widget for a field by using the BoundField's value method.
    var UserRegistration = forms.Form({
      username: forms.CharField({maxLength: 10, initial: "djangonaut"}),
      password: forms.CharField({widget: forms.PasswordInput})
    });
    var unbound = UserRegistration();
    var bound = UserRegistration({data: {password: "foo"}});
    strictEqual(bound.boundField("username").value(), null);
    equal(unbound.boundField("username").value(), "djangonaut");
    equal(bound.boundField("password").value(), "foo");
    strictEqual(unbound.boundField("password").value(), null);
});

test("Help text", function()
{
    expect(5);
    // You can specify descriptive text for a field by using the "helpText"
    // argument to a Field class. This help text is displayed when a Form is
    // rendered.
    var UserRegistration = forms.Form({
      username: forms.CharField({maxLength: 10, helpText: "e.g., user@example.com"}),
      password: forms.CharField({widget: forms.PasswordInput, helpText: "Choose wisely."})
    });
    var p = UserRegistration({autoId: false});
    equal(""+p.asUL(),
"<li>Username: <input maxlength=\"10\" type=\"text\" name=\"username\"> e.g., user@example.com</li>\n" +
"<li>Password: <input type=\"password\" name=\"password\"> Choose wisely.</li>");
    equal(""+p.asP(),
"<p>Username: <input maxlength=\"10\" type=\"text\" name=\"username\"> e.g., user@example.com</p>\n" +
"<p>Password: <input type=\"password\" name=\"password\"> Choose wisely.</p>");
    equal(""+p.asTable(),
"<tr><th>Username:</th><td><input maxlength=\"10\" type=\"text\" name=\"username\"><br>e.g., user@example.com</td></tr>\n" +
"<tr><th>Password:</th><td><input type=\"password\" name=\"password\"><br>Choose wisely.</td></tr>");

    // The help text is displayed whether or not data is provided for the form.
    p = UserRegistration({data: {username: "foo"}, autoId: false});
    equal(""+p.asUL(),
"<li>Username: <input maxlength=\"10\" type=\"text\" name=\"username\" value=\"foo\"> e.g., user@example.com</li>\n" +
"<li><ul class=\"errorlist\"><li>This field is required.</li></ul>Password: <input type=\"password\" name=\"password\"> Choose wisely.</li>");

    // Help text is not displayed for hidden fields. It can be used for
    // documentation purposes, though.
    UserRegistration = forms.Form({
      username: forms.CharField({maxLength: 10, helpText: "e.g., user@example.com"}),
      password: forms.CharField({widget: forms.PasswordInput}),
      next: forms.CharField({widget: forms.HiddenInput, initial: "/", helpText: "Redirect destination"})
    });
    p  = UserRegistration({autoId: false});
    equal(""+p.asUL(),
"<li>Username: <input maxlength=\"10\" type=\"text\" name=\"username\"> e.g., user@example.com</li>\n" +
"<li>Password: <input type=\"password\" name=\"password\"><input type=\"hidden\" name=\"next\" value=\"/\"></li>");
});

test("Subclassing forms", function()
{
    expect(9);
    // You can subclass a Form to add fields. The resulting form subclass will
    // have all of the fields of the parent Form, plus whichever fields you
    // define in the subclass.
    var Person = forms.Form({
      first_name: forms.CharField(),
      last_name: forms.CharField(),
      birthday: forms.DateField()
    });
    var Musician = forms.Form({form: Person,
      instrument: forms.CharField()
    });
    var p = Person({autoId: false});
    equal(""+p.asUL(),
"<li>First name: <input type=\"text\" name=\"first_name\"></li>\n" +
"<li>Last name: <input type=\"text\" name=\"last_name\"></li>\n" +
"<li>Birthday: <input type=\"text\" name=\"birthday\"></li>");
    var m = Musician({autoId: false});
    equal(""+m.asUL(),
"<li>First name: <input type=\"text\" name=\"first_name\"></li>\n" +
"<li>Last name: <input type=\"text\" name=\"last_name\"></li>\n" +
"<li>Birthday: <input type=\"text\" name=\"birthday\"></li>\n" +
"<li>Instrument: <input type=\"text\" name=\"instrument\"></li>");

    // You can "subclass" multiple forms by passing a list of constructors. The
    // fields are added in the order in which the parent Forms are listed.
    var Person = forms.Form({
      first_name: forms.CharField(),
      last_name: forms.CharField(),
      birthday: forms.DateField(),

      clean_first_name: function() {
          throw forms.ValidationError("Method from Person.");
      },
      clean_last_name: function() {
          throw forms.ValidationError("Method from Person.");
      }
    });
    var Instrument = forms.Form({
      instrument: forms.CharField(),

      clean_birthday: function() {
          throw forms.ValidationError("Method from Instrument.");
      }
    });
    var Beatle = forms.Form({
        form: [Person, Instrument],
        haircut_type: forms.CharField(),

        clean_last_name: function() {
            throw forms.ValidationError("Method from Beatle.");
        }
    });
    var b = Beatle({autoId: false});
    equal(""+b.asUL(),
"<li>First name: <input type=\"text\" name=\"first_name\"></li>\n" +
"<li>Last name: <input type=\"text\" name=\"last_name\"></li>\n" +
"<li>Birthday: <input type=\"text\" name=\"birthday\"></li>\n" +
"<li>Instrument: <input type=\"text\" name=\"instrument\"></li>\n" +
"<li>Haircut type: <input type=\"text\" name=\"haircut_type\"></li>");

    var b = Beatle({data:{first_name: "Alan", last_name: "Partridge", birthday: "1960-04-01", instrument: "Voice", haircut_type: "Floppy"}});
    deepEqual(b.errors("first_name").errors, ["Method from Person."]);
    deepEqual(b.errors("birthday").errors, ["Method from Instrument."]);
    deepEqual(b.errors("last_name").errors, ["Method from Beatle."]);

    // JavaScript doesn't support multiple inheritance, so this is actually a
    // bit of a hack. These tests will highlight the fallout from this (well,
    // the ones I know about, at least).
    strictEqual(b instanceof forms.BaseForm, true);
    strictEqual(b instanceof Person, true);
    // An instance of the first Form passed as a parent is used as the base
    // prototype object for our new Form - methods are merely borrowed from any
    // additional Forms, so instanceof only works for the first Form passed.
    strictEqual(b instanceof Instrument, false);
});

test("Forms with prefixes", function()
{
    expect(30);
    // Sometimes it's necessary to have multiple forms display on the same HTML
    // page, or multiple copies of the same form. We can accomplish this with
    // form prefixes. Pass a "prefix" argument to the Form constructor to use
    // this feature. This value will be prepended to each HTML form field name.
    // One way to think about this is "namespaces for HTML forms". Notice that
    // in the data argument, each field's key has the prefix, in this case
    // "person1", prepended to the actual field name.
    var Person = forms.Form({
      first_name: forms.CharField(),
      last_name: forms.CharField(),
      birthday: forms.DateField()
    });
    var data = {
        "person1-first_name": "John",
        "person1-last_name": "Lennon",
        "person1-birthday": "1940-10-9"
    };
    var p = Person({data: data, prefix: "person1"});
    equal(""+p.asUL(),
"<li><label for=\"id_person1-first_name\">First name:</label> <input type=\"text\" name=\"person1-first_name\" id=\"id_person1-first_name\" value=\"John\"></li>\n" +
"<li><label for=\"id_person1-last_name\">Last name:</label> <input type=\"text\" name=\"person1-last_name\" id=\"id_person1-last_name\" value=\"Lennon\"></li>\n" +
"<li><label for=\"id_person1-birthday\">Birthday:</label> <input type=\"text\" name=\"person1-birthday\" id=\"id_person1-birthday\" value=\"1940-10-9\"></li>");
    equal(""+p.boundField("first_name"),
"<input type=\"text\" name=\"person1-first_name\" id=\"id_person1-first_name\" value=\"John\">");
    equal(""+p.boundField("last_name"),
"<input type=\"text\" name=\"person1-last_name\" id=\"id_person1-last_name\" value=\"Lennon\">");
    equal(""+p.boundField("birthday"),
"<input type=\"text\" name=\"person1-birthday\" id=\"id_person1-birthday\" value=\"1940-10-9\">");
    strictEqual(p.errors().isPopulated(), false);
    strictEqual(p.isValid(), true);
    equal(p.cleanedData["first_name"], "John");
    equal(p.cleanedData["last_name"], "Lennon");
    equal(p.cleanedData["birthday"].valueOf(), new Date(1940, 9, 9).valueOf());

    // Let's try submitting some bad data to make sure form.errors and
    // field.errors work as expected.
    data = {
        "person1-first_name": "",
        "person1-last_name": "",
        "person1-birthday": ""
    };
    p = Person({data: data, prefix: "person1"});
    deepEqual(p.errors("first_name").errors, ["This field is required."]);
    deepEqual(p.errors("last_name").errors, ["This field is required."]);
    deepEqual(p.errors("birthday").errors, ["This field is required."]);
    deepEqual(p.boundField("first_name").errors().errors, ["This field is required."]);
    try { p.boundField("person1-first_name"); } catch(e) { equal(e.message, "Form does not have a 'person1-first_name' field."); }

    // In this example, the data doesn't have a prefix, but the form requires
    // it, so the form doesn't "see" the fields.
    data = {
        "first_name": "John",
        "last_name": "Lennon",
        "birthday": "1940-10-9"
    };
    p = Person({data: data, prefix: "person1"});
    deepEqual(p.errors("first_name").errors, ["This field is required."]);
    deepEqual(p.errors("last_name").errors, ["This field is required."]);
    deepEqual(p.errors("birthday").errors, ["This field is required."]);

    // With prefixes, a single data object can hold data for multiple instances
    // of the same form.
    data = {
        "person1-first_name": "John",
        "person1-last_name": "Lennon",
        "person1-birthday": "1940-10-9",
        "person2-first_name": "Jim",
        "person2-last_name": "Morrison",
        "person2-birthday": "1943-12-8"
    };
    var p1 = Person({data: data, prefix: "person1"});
    strictEqual(p1.isValid(), true);
    equal(p1.cleanedData["first_name"], "John");
    equal(p1.cleanedData["last_name"], "Lennon");
    equal(p1.cleanedData["birthday"].valueOf(), new Date(1940, 9, 9).valueOf());
    var p2 = Person({data: data, prefix: "person2"});
    strictEqual(p2.isValid(), true);
    equal(p2.cleanedData["first_name"], "Jim");
    equal(p2.cleanedData["last_name"], "Morrison");
    equal(p2.cleanedData["birthday"].valueOf(), new Date(1943, 11, 8).valueOf());

    // By default, forms append a hyphen between the prefix and the field name,
    // but a form can alter that behavior by implementing the addPrefix()
    // method. This method takes a field name and returns the prefixed field,
    // according to this.prefix.
    Person = forms.Form({
      first_name: forms.CharField(),
      last_name: forms.CharField(),
      birthday: forms.DateField(),

      addPrefix: function(fieldName) {
          if (this.prefix) {
              return this.prefix + "-prefix-" + fieldName;
          }
          return fieldName;
      }
    });
    p = Person({prefix: "foo"});
    equal(""+p.asUL(),
"<li><label for=\"id_foo-prefix-first_name\">First name:</label> <input type=\"text\" name=\"foo-prefix-first_name\" id=\"id_foo-prefix-first_name\"></li>\n" +
"<li><label for=\"id_foo-prefix-last_name\">Last name:</label> <input type=\"text\" name=\"foo-prefix-last_name\" id=\"id_foo-prefix-last_name\"></li>\n" +
"<li><label for=\"id_foo-prefix-birthday\">Birthday:</label> <input type=\"text\" name=\"foo-prefix-birthday\" id=\"id_foo-prefix-birthday\"></li>");
    data = {
        "foo-prefix-first_name": "John",
        "foo-prefix-last_name": "Lennon",
        "foo-prefix-birthday": "1940-10-9"
    };
    p = Person({data: data, prefix: "foo"});
    strictEqual(p.isValid(), true);
    equal(p.cleanedData["first_name"], "John");
    equal(p.cleanedData["last_name"], "Lennon");
    equal(p.cleanedData["birthday"].valueOf(), new Date(1940, 9, 9).valueOf());
});

test("Forms with null boolean", function()
{
    expect(6);
    // NullBooleanField is a bit of a special case because its presentation
    // (widget) is different than its data. This is handled transparently,
    // though.
    var Person = forms.Form({
      name: forms.CharField(),
      is_cool: forms.NullBooleanField()
    });
    var p = Person({data: {name: "Joe"}, autoId: false});
    equal(""+p.boundField("is_cool"),
"<select name=\"is_cool\">\n" +
"<option value=\"1\" selected=\"selected\">Unknown</option>\n" +
"<option value=\"2\">Yes</option>\n" +
"<option value=\"3\">No</option>\n" +
"</select>");
    p = Person({data: {name: "Joe", is_cool: "1"}, autoId: false});
    equal(""+p.boundField("is_cool"),
"<select name=\"is_cool\">\n" +
"<option value=\"1\" selected=\"selected\">Unknown</option>\n" +
"<option value=\"2\">Yes</option>\n" +
"<option value=\"3\">No</option>\n" +
"</select>");
    p = Person({data: {name: "Joe", is_cool: "2"}, autoId: false});
    equal(""+p.boundField("is_cool"),
"<select name=\"is_cool\">\n" +
"<option value=\"1\">Unknown</option>\n" +
"<option value=\"2\" selected=\"selected\">Yes</option>\n" +
"<option value=\"3\">No</option>\n" +
"</select>");
    p = Person({data: {name: "Joe", is_cool: "3"}, autoId: false});
    equal(""+p.boundField("is_cool"),
"<select name=\"is_cool\">\n" +
"<option value=\"1\">Unknown</option>\n" +
"<option value=\"2\">Yes</option>\n" +
"<option value=\"3\" selected=\"selected\">No</option>\n" +
"</select>");
    p = Person({data: {name: "Joe", is_cool: true}, autoId: false});
    equal(""+p.boundField("is_cool"),
"<select name=\"is_cool\">\n" +
"<option value=\"1\">Unknown</option>\n" +
"<option value=\"2\" selected=\"selected\">Yes</option>\n" +
"<option value=\"3\">No</option>\n" +
"</select>");
    p = Person({data: {name: "Joe", is_cool: false}, autoId: false});
    equal(""+p.boundField("is_cool"),
"<select name=\"is_cool\">\n" +
"<option value=\"1\">Unknown</option>\n" +
"<option value=\"2\">Yes</option>\n" +
"<option value=\"3\" selected=\"selected\">No</option>\n" +
"</select>");
});

test("Forms with file fields", function()
{
    expect(6);

    function SimpleUploadedFile(name, content)
    {
        this.name = name;
        this.content = content;
        this.size = (content !== null ? content.length : 0);
    }

    // FileFields are a special case because they take their data from the
    // "files" data object, not "data".
    var FileForm = forms.Form({file1: forms.FileField()});
    var f = FileForm({autoId: false});
    equal(""+f,
           "<tr><th>File1:</th><td><input type=\"file\" name=\"file1\"></td></tr>");

    f = FileForm({data: {}, files: {}, autoId: false});
    equal(""+f,
           "<tr><th>File1:</th><td><ul class=\"errorlist\"><li>This field is required.</li></ul><input type=\"file\" name=\"file1\"></td></tr>");

    f = FileForm({data: {}, files: {file1: new SimpleUploadedFile("name", "")}, autoId: false});
    equal(""+f,
           "<tr><th>File1:</th><td><ul class=\"errorlist\"><li>The submitted file is empty.</li></ul><input type=\"file\" name=\"file1\"></td></tr>");

    f = FileForm({data: {}, files: {file1: "something that is not a file"}, autoId: false});
    equal(""+f,
           "<tr><th>File1:</th><td><ul class=\"errorlist\"><li>No file was submitted. Check the encoding type on the form.</li></ul><input type=\"file\" name=\"file1\"></td></tr>");

    f = FileForm({data: {}, files: {file1: new SimpleUploadedFile("name", "some content")}, autoId: false});
    equal(""+f,
           "<tr><th>File1:</th><td><input type=\"file\" name=\"file1\"></td></tr>");
    strictEqual(f.isValid(), true);
});

test("Basic form processing", function()
{
    expect(3);

    var UserRegistration = forms.Form({
      username: forms.CharField({maxLength: 10}),
      password1: forms.CharField({widget: forms.PasswordInput}),
      password2: forms.CharField({widget: forms.PasswordInput}),

      clean: function() {
          if (this.cleanedData.password1 && this.cleanedData.password2 &&
              this.cleanedData.password1 != this.cleanedData.password2)
          {
              throw forms.ValidationError("Please make sure your passwords match.");
          }
          return this.cleanedData;
      }
    });

    function myFunction(method, postData)
    {
        if (method == "POST")
        {
            var form = UserRegistration({data: postData, autoId: false});
            if (form.isValid())
                return "VALID";
        }
        else
        {
            var form = UserRegistration({autoId: false});
        }
        var template = "<form action=\"\" method=\"POST\">\n<table>\n%(form)s\n</table>\n<input type=\"submit\">\n</form>";
        return forms.util.format(template, {form: form});
    }

    // Case 1: GET (and empty form, with no errors)
    equal(myFunction("GET", {}),
"<form action=\"\" method=\"POST\">\n" +
"<table>\n" +
"<tr><th>Username:</th><td><input maxlength=\"10\" type=\"text\" name=\"username\"></td></tr>\n" +
"<tr><th>Password1:</th><td><input type=\"password\" name=\"password1\"></td></tr>\n" +
"<tr><th>Password2:</th><td><input type=\"password\" name=\"password2\"></td></tr>\n" +
"</table>\n" +
"<input type=\"submit\">\n" +
"</form>");

    // Case 2: POST with erroneous data (a redisplayed form, with errors)
    equal(myFunction("POST", {username: "this-is-a-long-username", password1: "foo", password2: "bar"}),
"<form action=\"\" method=\"POST\">\n" +
"<table>\n" +
"<tr><td colspan=\"2\"><ul class=\"errorlist\"><li>Please make sure your passwords match.</li></ul></td></tr>\n" +
"<tr><th>Username:</th><td><ul class=\"errorlist\"><li>Ensure this value has at most 10 characters (it has 23).</li></ul><input maxlength=\"10\" type=\"text\" name=\"username\" value=\"this-is-a-long-username\"></td></tr>\n" +
"<tr><th>Password1:</th><td><input type=\"password\" name=\"password1\"></td></tr>\n" +
"<tr><th>Password2:</th><td><input type=\"password\" name=\"password2\"></td></tr>\n" +
"</table>\n" +
"<input type=\"submit\">\n" +
"</form>");

    // Case 3: POST with valid data (the success message)
   equal(myFunction("POST", {username: "adrian", password1: "secret", password2: "secret"}),
          "VALID");
});

test("emptyPermitted", function()
{
    expect(12);
    // Sometimes (pretty much in formsets) we want to allow a form to pass
    // validation if it is completely empty. We can accomplish this by using the
    // emptyPermitted argument to a form constructor.
    var SongForm = forms.Form({
      artist: forms.CharField(),
      name: forms.CharField()
    });

    // First let's show what happens if emptyPermitted == false (the default)
    var data = {artist: "", name: ""};
    var form = SongForm({data: data, emptyPermitted: false});
    strictEqual(form.isValid(), false)
    deepEqual(form.errors("artist").errors, ["This field is required."]);
    deepEqual(form.errors("name").errors, ["This field is required."]);
    equal(typeof form.cleanedData, "undefined");

    // Now let's show what happens when emptyPermitted == true and the form is
    // empty.
    form = SongForm({data: data, emptyPermitted: true});
    strictEqual(form.isValid(), true);
    strictEqual(form.errors().isPopulated(), false);
    deepEqual(form.cleanedData, {});

    // But if we fill in data for one of the fields, the form is no longer empty
    // and the whole thing must pass validation.
    data = {artist: "The Doors", name: ""};
    form = SongForm({data: data, emptyPermitted: true});
    strictEqual(form.isValid(), false)
    deepEqual(form.errors("name").errors, ["This field is required."]);
    equal(typeof form.cleanedData, "undefined");

    // If a field is not given in the data then null is returned for its data.
    // Make sure that when checking for emptyPermitted that null is treated
    // accordingly.
    data = {artist: null, name: ""};
    form = SongForm({data: data, emptyPermitted: true});
    strictEqual(form.isValid(), true);

    // However, we *really* need to be sure we are checking for null as any data
    // in initial that is falsy in a boolean context needs to be treated
    // literally.
    var PriceForm = forms.Form({
      amount: forms.FloatField(),
      qty: forms.IntegerField()
    });

    data = {amount: "0.0", qty: ""};
    form = PriceForm({data: data, initial: {amount: 0.0}, emptyPermitted: true});
    strictEqual(form.isValid(), true);
});

test("Extracting hidden and visible", function()
{
    expect(2);
    var SongForm = forms.Form({
      token: forms.CharField({widget: forms.HiddenInput}),
      artist: forms.CharField(),
      name: forms.CharField()
    });
    var form = SongForm();
    var hidden = form.hiddenFields();
    deepEqual([hidden.length, hidden[0].name], [1, "token"]);
    var visible = form.visibleFields();
    deepEqual([visible.length, visible[0].name, visible[1].name], [2, "artist", "name"]);
});

test("Hidden initial gets id", function()
{
    expect(1);
    var MyForm = forms.Form({
      field1: forms.CharField({maxLength: 50, showHiddenInitial: true})
    });
    equal(""+MyForm().asTable(),
"<tr><th><label for=\"id_field1\">Field1:</label></th><td><input maxlength=\"50\" type=\"text\" name=\"field1\" id=\"id_field1\"><input type=\"hidden\" name=\"initial-field1\" id=\"initial-id_field1\"></td></tr>");
});

test("Error/required HTML classes", function()
{
    expect(3);
    var Person = forms.Form({
      name: forms.CharField(),
      is_cool: forms.NullBooleanField(),
      email: forms.EmailField({required: false}),
      age: forms.IntegerField()
    });

    var p = Person({data: {}});
    p.errorCssClass = "error";
    p.requiredCssClass = "required";
    equal(""+p.asUL(),
"<li class=\"error required\"><ul class=\"errorlist\"><li>This field is required.</li></ul><label for=\"id_name\">Name:</label> <input type=\"text\" name=\"name\" id=\"id_name\"></li>\n" +
"<li class=\"required\"><label for=\"id_is_cool\">Is cool:</label> <select name=\"is_cool\" id=\"id_is_cool\">\n" +
"<option value=\"1\" selected=\"selected\">Unknown</option>\n" +
"<option value=\"2\">Yes</option>\n" +
"<option value=\"3\">No</option>\n" +
"</select></li>\n" +
"<li><label for=\"id_email\">Email:</label> <input type=\"text\" name=\"email\" id=\"id_email\"></li>\n" +
"<li class=\"error required\"><ul class=\"errorlist\"><li>This field is required.</li></ul><label for=\"id_age\">Age:</label> <input type=\"text\" name=\"age\" id=\"id_age\"></li>");
    equal(""+p.asP(),
"<ul class=\"errorlist\"><li>This field is required.</li></ul>\n" +
"<p class=\"error required\"><label for=\"id_name\">Name:</label> <input type=\"text\" name=\"name\" id=\"id_name\"></p>\n" +
"<p class=\"required\"><label for=\"id_is_cool\">Is cool:</label> <select name=\"is_cool\" id=\"id_is_cool\">\n" +
"<option value=\"1\" selected=\"selected\">Unknown</option>\n" +
"<option value=\"2\">Yes</option>\n" +
"<option value=\"3\">No</option>\n" +
"</select></p>\n" +
"<p><label for=\"id_email\">Email:</label> <input type=\"text\" name=\"email\" id=\"id_email\"></p>\n" +
"<ul class=\"errorlist\"><li>This field is required.</li></ul>\n" +
"<p class=\"error required\"><label for=\"id_age\">Age:</label> <input type=\"text\" name=\"age\" id=\"id_age\"></p>");
    equal(""+p.asTable(),
"<tr class=\"error required\"><th><label for=\"id_name\">Name:</label></th><td><ul class=\"errorlist\"><li>This field is required.</li></ul><input type=\"text\" name=\"name\" id=\"id_name\"></td></tr>\n" +
"<tr class=\"required\"><th><label for=\"id_is_cool\">Is cool:</label></th><td><select name=\"is_cool\" id=\"id_is_cool\">\n" +
"<option value=\"1\" selected=\"selected\">Unknown</option>\n" +
"<option value=\"2\">Yes</option>\n" +
"<option value=\"3\">No</option>\n" +
"</select></td></tr>\n" +
"<tr><th><label for=\"id_email\">Email:</label></th><td><input type=\"text\" name=\"email\" id=\"id_email\"></td></tr>\n" +
"<tr class=\"error required\"><th><label for=\"id_age\">Age:</label></th><td><ul class=\"errorlist\"><li>This field is required.</li></ul><input type=\"text\" name=\"age\" id=\"id_age\"></td></tr>");
});

test("Label split datetime not displayed", function()
{
    expect(1);
    var EventForm = forms.Form({
      happened_at: forms.SplitDateTimeField({widget: forms.SplitHiddenDateTimeWidget})
    });
    var form = EventForm();
    equal(""+form.asUL(),
"<li><input type=\"hidden\" name=\"happened_at_0\" id=\"id_happened_at_0\"><input type=\"hidden\" name=\"happened_at_1\" id=\"id_happened_at_1\"></li>");
});

test("Multipart-encoded forms", function()
{
    expect(3);
    var FormWithoutFile = forms.Form({username: forms.CharField()});
    var FormWithFile = forms.Form({file: forms.FileField()});
    var FormWithImage = forms.Form({file: forms.ImageField()});

    strictEqual(FormWithoutFile().isMultipart(), false);
    strictEqual(FormWithFile().isMultipart(), true);
    strictEqual(FormWithImage().isMultipart(), true);
});

})();