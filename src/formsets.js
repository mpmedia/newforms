// Special field names
var TOTAL_FORM_COUNT = 'TOTAL_FORMS'
  , INITIAL_FORM_COUNT = 'INITIAL_FORMS'
    MAX_NUM_FORM_COUNT = 'MAX_NUM_FORMS'
    ORDERING_FIELD_NAME = 'ORDER'
  , DELETION_FIELD_NAME = 'DELETE';

/**
 * ManagementForm is used to keep track of how many form instances are displayed
 * on the page. If adding new forms via javascript, you should increment the
 * count field of this form as well.
 * @constructor
 */
var ManagementForm = (function() {
  var fields = {};
  fields[TOTAL_FORM_COUNT] = IntegerField({widget: HiddenInput});
  fields[INITIAL_FORM_COUNT] = IntegerField({widget: HiddenInput});
  fields[MAX_NUM_FORM_COUNT] = IntegerField({required: false, widget: HiddenInput});
  return Form(fields);
})();

/**
 * A collection of instances of the same Form.
 *
 * @param {Object} [kwargs] configuration options.
 * @config {Object} [data] input form data, where property names are field
 *                         names.
 * @config {Object} [files] input file data - this is meaningless on the
 *                          client-side, but is included for future use in any
 *                          future server-side implementation.
 * @config {String} [autoId] a template for use when automatically generating
 *                           <code>id</code> attributes for fields, which should
 *                           contain a <code>%(name)s</code> placeholder for
 *                           the field name - defaults to
 *                           <code>id_%(name)s</code>.
 * @config {String} [prefix] a prefix to be applied to the name of each field in
 *                           each form instance.
 * @config {Object} [initial] a list of initial form data objects, where
 *                            property names are field names - if a field's
 *                            value is not specified in <code>data</code>, these
 *                            values will be used when rendering field widgets.
 * @config {Function} [errorConstructor] the constructor function to be used
 *                                       when creating error details - defaults
 *                                       to {@link ErrorList}.
 * @constructor
 */
function BaseFormSet(kwargs) {
  kwargs = extend({
    data: null, files: null, autoId: 'id_%(name)s', prefix: null,
    initial: null, errorConstructor: ErrorList
  }, kwargs || {});
  this.isBound = kwargs.data !== null || kwargs.files !== null;
  this.prefix = kwargs.prefix || BaseFormSet.getDefaultPrefix();
  this.autoId = kwargs.autoId;
  this.data = kwargs.data || {};
  this.files = kwargs.files || {};
  this.initial = kwargs.initial;
  this.errorConstructor = kwargs.errorConstructor;
  this._errors = null;
  this._nonFormErrors = null;

  // Construct the forms in the formset
  this._constructForms();
}
BaseFormSet.getDefaultPrefix = function() { return 'form'; };

BaseFormSet.prototype = {
  /**
   * Returns the ManagementForm instance for this FormSet.
   */
  /*get */managementForm: function() {
    if (this.isBound) {
      var form = ManagementForm({data: this.data, autoId: this.autoId,
                                 prefix: this.prefix});
      if (!form.isValid()) {
        throw ValidationError('ManagementForm data is missing or has been tampered with');
      }
    }
    else {
      var initial = {};
      initial[TOTAL_FORM_COUNT] = this.totalFormCount();
      initial[INITIAL_FORM_COUNT] = this.initialFormCount();
      initial[MAX_NUM_FORM_COUNT] = this.maxNum;
      var form = ManagementForm({autoId: this.autoId,
                                 prefix: this.prefix,
                                 initial: initial});
    }
    return form;
  }

, /*get */initialForms: function() {
    return this.forms.slice(0, this.initialFormCount());
  }

, /*get */extraForms: function() {
    return this.forms.slice(this.initialFormCount());
  }

, /*get */emptyForm: function(kwargs) {
    var defaults = {
      autoId: this.autoId,
      prefix: this.addPrefix('__prefix__'),
      emptyPermitted: true
    };
    var formKwargs = extend(defaults, kwargs || {});
    var form = new this.form(formKwargs);
    this.addFields(form, null);
    return form;
  }

  /**
   * Returns a list of form.cleanedData objects for every form in this.forms.
   */
, /*get */cleanedData: function() {
    if (!this.isValid()) {
      throw new Error(this.constructor.name +
                      " object has no attribute 'cleanedData'");
    }
    var cleaned = [];
    for (var i = 0, l = this.forms.length; i < l; i++) {
      cleaned.push(this.forms[i].cleanedData);
    }
    return cleaned;
  }

  /**
   * Returns a list of forms that have been marked for deletion. Throws an
   * error if deletion is not allowed.
   */
, /*get */deletedForms: function() {
    if (!this.isValid() || !this.canDelete) {
      throw new Error(this.constructor.name +
                      " object has no attribute 'deletedForms'");
    }

    // Construct _deletedFormIndexes, which is just a list of form indexes
    // that have had their deletion widget set to true.
    if (typeof this._deletedFormIndexes == 'undefined') {
      this._deletedFormIndexes = [];
      var totalFormCount = this.totalFormCount();
      for (var i = 0; i < totalFormCount; i++) {
        var form = this.forms[i];
        // If this is an extra form and hasn't changed, ignore it
        if (i >= this.initialFormCount() && !form.hasChanged()) {
          continue;
        }
        if (this._shouldDeleteForm(form)) {
          this._deletedFormIndexes.push(i);
        }
      }
    }

    var deletedForms = [];
    for (var i = 0, l = this._deletedFormIndexes.length; i < l; i++) {
      deletedForms.push(this.forms[this._deletedFormIndexes[i]]);
    }
    return deletedForms;
  }

  /**
   * Returns a list of forms in the order specified by the incoming data.
   * Throws an Error if ordering is not allowed.
   */
, /*get */orderedForms: function() {
    if (!this.isValid() || !this.canOrder) {
      throw new Error(this.constructor.name +
                      " object has no attribute 'orderedForms'");
    }

    // Construct _ordering, which is a list of [form index, orderFieldValue]
    // pairs. After constructing this list, we'll sort it by orderFieldValue
    // so we have a way to get to the form indexes in the order specified by
    // the form data.
    if (typeof this._ordering == 'undefined') {
      this._ordering = [];
      var totalFormCount = this.totalFormCount();
      for (var i = 0; i < totalFormCount; i++) {
        var form = this.forms[i];
        // If this is an extra form and hasn't changed, ignore it
        if (i >= this.initialFormCount() && !form.hasChanged()) {
          continue;
        }
        // Don't add data marked for deletion
        if (this.canDelete && this._shouldDeleteForm(form)) {
          continue;
        }
        this._ordering.push([i, form.cleanedData[ORDERING_FIELD_NAME]]);
      }

      // Null should be sorted below anything else. Allowing null as a
      // comparison value makes it so we can leave ordering fields blank.
      this._ordering.sort(function(x, y) {
        if (x[1] === null && y[1] === null) {
          // Sort by form index if both order field values are null
          return x[0] - y[0];
        }
        if (x[1] === null) {
          return 1;
        }
        if (y[1] === null) {
          return -1;
        }
        return x[1] - y[1];
      });
    }

    var orderedForms = [];
    for (var i = 0, l = this._ordering.length; i < l; i++) {
      orderedForms.push(this.forms[this._ordering[i][0]]);
    }
    return orderedForms;
  }

  /**
   * Returns a list of form.errors for every form in this.forms.
   */
, /*get */errors: function() {
    if (this._errors === null) {
      this.fullClean();
    }
    return this._errors;
  }
};

BaseFormSet.prototype.toString = function() {
  return ''+this.defaultRendering();
};

BaseFormSet.prototype.toString.safe = true;

BaseFormSet.prototype.defaultRendering = function(){
  return this.asTable();
};

/**
 * Determines the number of form instances this formset contains, based on
 * either submitted management data or initial configuration, as appropriate.
 */
BaseFormSet.prototype.totalFormCount = function() {
  if (this.isBound) {
    return this.managementForm().cleanedData[TOTAL_FORM_COUNT];
  }
  else {
    var initialForms = this.initialFormCount()
      , totalForms = this.initialFormCount() + this.extra;
    // Allow all existing related objects/inlines to be displayed, but don't
    // allow extra beyond max_num.
    if (this.maxNum !== null &&
        initialForms > this.maxNum &&
        this.maxNum >= 0) {
      totalForms = initialForms;
    }
    if (this.maxNum !== null &&
        totalForms > this.maxNum &&
        this.maxNum >= 0) {
      totalForms = this.maxNum;
    }
    return totalForms;
  }
};

/**
 * Determines the number of initial form instances this formset contains, based
 * on either submitted management data or initial configuration, as appropriate.
 */
BaseFormSet.prototype.initialFormCount = function() {
  if (this.isBound) {
    return this.managementForm().cleanedData[INITIAL_FORM_COUNT];
  }
  else {
    // Use the length of the inital data if it's there, 0 otherwise.
    var initialForms = (this.initial !== null && this.initial.length > 0
                        ? this.initial.length
                        : 0);
    if (this.maxNum !== null &&
        initialForms > this.maxNum &&
        this.maxNum >= 0) {
      initialForms = this.maxNum;
    }
    return initialForms;
  }
};

/**
 * Instantiates all the forms and put them in <code>this.forms</code>.
 */
BaseFormSet.prototype._constructForms = function() {
  this.forms = [];
  var totalFormCount = this.totalFormCount();
  for (var i = 0; i < totalFormCount; i++) {
    this.forms.push(this._constructForm(i));
  }
};

/**
 * Instantiates and returns the <code>i</code>th form instance in the formset.
 */
BaseFormSet.prototype._constructForm = function(i, kwargs) {
  var defaults = {autoId: this.autoId, prefix: this.addPrefix(i)};

  if (this.isBound) {
    defaults['data'] = this.data;
    defaults['files'] = this.files;
  }

  if (this.initial !== null && this.initial.length > 0) {
    if (typeof this.initial[i] != 'undefined') {
      defaults['initial'] = this.initial[i];
    }
  }

  // Allow extra forms to be empty
  if (i >= this.initialFormCount()) {
    defaults['emptyPermitted'] = true;
  }

  var formKwargs = extend(defaults, kwargs || {});
  var form = new this.form(formKwargs);
  this.addFields(form, i);
  return form;
};

/**
 * Returns an ErrorList of errors that aren't associated with a particular
 * form -- i.e., from <code>formset.clean()</code>. Returns an empty ErrorList
 * if there are none.
 */
BaseFormSet.prototype.nonFormErrors = function() {
  if (this._nonFormErrors !== null) {
    return this._nonFormErrors;
  }
  return new this.errorConstructor();
};

BaseFormSet.prototype._shouldDeleteForm = function(form) {
  // The way we lookup the value of the deletion field here takes
  // more code than we'd like, but the form's cleanedData will not
  // exist if the form is invalid.
  var field = form.fields[DELETION_FIELD_NAME]
    , rawValue = form._rawValue(DELETION_FIELD_NAME)
    , shouldDelete = field.clean(rawValue);
  return shouldDelete;
};

/**
 * Returns <code>true</code> if <code>form.errors</code> is empty for every form
 * in <code>this.forms</code>
 */
BaseFormSet.prototype.isValid = function() {
  if (!this.isBound) {
    return false;
  }

  // We loop over every form.errors here rather than short circuiting on the
  // first failure to make sure validation gets triggered for every form.
  var formsValid = true
    , errors = this.errors() // Triggers fullClean()
    , totalFormCount = this.totalFormCount();
  for (var i = 0; i < totalFormCount; i++) {
    var form = this.forms[i];
    if (this.canDelete && this._shouldDeleteForm(form)) {
      // This form is going to be deleted so any of its errors should
      // not cause the entire formset to be invalid.
      continue;
    }
    if (errors[i].isPopulated()) {
      formsValid = false;
    }
  }

  return (formsValid && !this.nonFormErrors().isPopulated());
};

/**
 * Cleans all of <code>this.data</code> and populates <code>this._errors</code>.
 */
BaseFormSet.prototype.fullClean = function() {
  this._errors = [];
  if (!this.isBound) {
    return; // Stop further processing
  }

  var totalFormCount = this.totalFormCount();
  for (var i = 0; i < totalFormCount; i++) {
    var form = this.forms[i];
    this._errors.push(form.errors());
  }

  // Give this.clean() a chance to do cross-form validation.
  try {
    this.clean();
  }
  catch (e) {
    if (!(e instanceof ValidationError)) {
      throw e;
    }
    this._nonFormErrors = new this.errorConstructor(e.messages);
  }
};

/**
 * Hook for doing any extra formset-wide cleaning after Form.clean() has been
 * called on every form. Any ValidationError raised by this method will not be
 * associated with a particular form; it will be accesible via
 * formset.nonFormErrors()
 */
BaseFormSet.prototype.clean = function() {};

/**
 * A hook for adding extra fields on to each form instance.
 *
 * @param {Form} form the form fields are to be added to.
 * @param {Number} index the index of the given form in the formset.
 */
BaseFormSet.prototype.addFields = function(form, index) {
  if (this.canOrder) {
    // Only pre-fill the ordering field for initial forms
    if (index !== null && index < this.initialFormCount()) {
      form.fields[ORDERING_FIELD_NAME] =
          IntegerField({label: 'Order', initial: index + 1,
                        required: false});
    }
    else {
      form.fields[ORDERING_FIELD_NAME] =
          IntegerField({label: 'Order', required: false});
    }
  }

  if (this.canDelete) {
    form.fields[DELETION_FIELD_NAME] =
        BooleanField({label: 'Delete', required: false});
  }
};

/**
 * Returns the formset prefix with the form index appended.
 *
 * @param {Number} index the index of a form in the formset.
 */
BaseFormSet.prototype.addPrefix = function(index) {
  return this.prefix + '-' + index;
};

/**
 * Returns <code>true</code> if the formset needs to be multipart-encrypted,
 * i.e. it has FileInput. Otherwise, <code>false</code>.
 */
BaseFormSet.prototype.isMultipart = function() {
  return (this.forms.length > 0 && this.forms[0].isMultipart());
};

/**
 * Returns this formset rendered as HTML &lt;tr&gt;s - excluding the
 * &lt;table&gt;&lt;/table&gt;.
 *
 * @param {Boolean} [doNotCoerce] if <code>true</code>, the resulting rows will
 *                                not be coerced to a String if we're operating
 *                                in HTML mode - defaults to <code>false</code>.
 */
BaseFormSet.prototype.asTable = function(doNotCoerce) {
  // XXX: there is no semantic division between forms here, there probably
  // should be. It might make sense to render each form as a table row with
  // each field as a td.
  var rows = this.managementForm().asTable(true);
  for (var i = 0, l = this.forms.length; i < l; i++) {
    rows = rows.concat(this.forms[i].asTable(true));
  }
  if (doNotCoerce === true || DOMBuilder.mode == 'dom') {
    return rows;
  }
  return ak.safe(rows.join("\n"));
};

BaseFormSet.prototype.asP = function(doNotCoerce) {
  var rows = this.managementForm().asP(true);
  for (var i = 0, l = this.forms.length; i < l; i++) {
    rows = rows.concat(this.forms[i].asP(true));
  }
  if (doNotCoerce === true || DOMBuilder.mode == 'dom') {
    return rows;
  }
  return ak.safe(rows.join("\n"));
};

BaseFormSet.prototype.asUL = function(doNotCoerce) {
  var rows = this.managementForm().asUL(true);
  for (var i = 0, l = this.forms.length; i < l; i++) {
    rows = rows.concat(this.forms[i].asUL(true));
  }
  if (doNotCoerce === true || DOMBuilder.mode == 'dom') {
    return rows;
  }
  return ak.safe(rows.join("\n"));
};

/**
 * Returns a FormSet constructor for the given Form constructor.
 *
 * @param {Form} form the constructor for the Form to be managed.
 * @param {Object} [kwargs] arguments defining options for the created FormSet
 *     constructor - all arguments other than those defined below will be added
 *     to the new formset constructor's <code>prototype</code>, so this object
 *     can also be used to define new methods on the resulting formset, such as
 *     a custom <code>clean</code> method.
 * @config {Function} [formset] the constructuer which will provide the
 *     prototype for the created FormSet constructor - defaults to
 *     <code>BaseFormSet</code>.
 * @config {Number} [extra] the number of extra forms to be displayed - defaults
 *                          to <code>1</code>.
 * @config {Boolean} [canOrder] if <code>true</code>, forms can be ordered -
 *                              defaults to <code>false</code>.
 * @config {Boolean} [canDelete] if <code>true</code>, forms can be deleted -
 *                               defaults to <code>false</code>.
 * @config {Number} [maxNum] the maximum number of forms to be displayed -
 *                           defaults to <code>0</code>.
 */
function FormSet(form, kwargs) {
  kwargs = extend({
    formset: BaseFormSet, extra: 1, canOrder: false, canDelete: false,
    maxNum: null
  }, kwargs || {});

  var formset = kwargs.formset
    , extra = kwargs.extra
    , canOrder = kwargs.canOrder
    , canDelete = kwargs.canDelete
    , maxNum = kwargs.maxNum;

  var formsetConstructor = function(kwargs) {
    if (!(this instanceof formset)) return new formsetConstructor(kwargs);
    this.form = form;
    this.extra = extra;
    this.canOrder = canOrder;
    this.canDelete = canDelete;
    this.maxNum = maxNum;
    formset.call(this, kwargs);
  };
  inheritFrom(formsetConstructor, formset);

  // Remove special properties from kwargs, as they will now be used to add
  // properties to the prototype.
  delete kwargs.formset;
  delete kwargs.extra;
  delete kwargs.canOrder;
  delete kwargs.canDelete;
  delete kwargs.maxNum;

  extend(formsetConstructor.prototype, kwargs);

  return formsetConstructor;
}

/**
 * Returns <code>true</code> if every formset in formsets is valid.
 */
function allValid(formsets) {
  var valid = true;
  for (var i = 0, l = formsets.length; i < l; i++) {
    if (!formsets[i].isValid()) {
        valid = false;
    }
  }
  return valid;
}
