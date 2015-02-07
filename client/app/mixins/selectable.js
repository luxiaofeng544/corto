/* jshint ignore:start */
import Ember from 'ember';

var  get, set, typeOf,
  __slice = [].slice;

get = Ember.get;

set = Ember.set;

typeOf = Ember.typeOf;


/*
 `Emberella.SelectableMixin` adds selection support to array controllers.

 This mixin is rough around the edges and is not verified to work
 across browsers.

 @class SelectableMixin
 @namespace Emberella
 */
export default Ember.Mixin.create({

  /*
   @property isSelectable
   @type Boolean
   @default true
   @final
   */
  isSelectable: true,
  init: function() {
    set(this, '_selection', Ember.A());
    get(this, 'selection');
    return this._super();
  },
  actions: {
    select: function() {
      return this.select.apply(this, arguments);
    },
    next: function() {
      return this.next.apply(this, arguments);
    },
    previous: function() {
      return this.previous.apply(this, arguments);
    }
  },

  /*
   A member of the content array. When expanding the selection, the selection
   will typically expand using the index of this object.

   @property cursor
   @type Object
   @default null
   */
  cursor: null,

  /*
   @private

   The complete set of all currently selected items.

   @property _selection
   @type Set
   @default null
   */
  _selection: null,

  /*
   The "active" selection: an array of items selected by the user that are
   also present in the content array. This allows the selection to be retained
   even if, for example, a filter removes a selected object from the `content`
   property. When the filter is removed, the previously selected object will,
   once again, appear to be selected.

   @property selection
   @type Array
   @default []
   */
  selection: Ember.computed(function() {
    var content, selection;
    content = this.getActiveContent();
    selection = get(this, '_selection');
    return selection.filter(function(item) {
      return content.contains(item);
    });
  }).property('_selection.[]', 'content', 'arrangedContent.[]'),

  /*
   The first member of the content array that would be a valid selection. The
   default behavior is to simply use the first item in the content array.
   Override this property with validation checks as needed.

   @property firstSelectableObject
   @type Object
   */
  firstSelectableObject: Ember.computed(function() {
    return get(this, 'firstObject');
  }).property('firstObject'),

  /*
   The last member of the content array that would be a valid selection. The
   default behavior is to simply use the last item in the content array.
   Override this property with validation checks as needed.

   @property firstSelectableObject
   @type Object
   */
  lastSelectableObject: Ember.computed(function() {
    return get(this, 'lastObject');
  }).property('lastObject'),

  /*
   Retrieve an array of items that could appear in the active selection.

   The default behavior is simply to return the `content` array. Override this
   method to introduce custom retrieval or assembly of the array of
   potentially selectable items.

   @method getActiveContent
   @return Array
   */
  getActiveContent: function() {
    return get(this, 'content');
  },

  /*
   Manipulate the selection set.

   Typically, this method will empty the selection set and add the specified
   item to the selection.

   Optionally, the selection status of a given item can be toggled or all
   items between the cursor and the specified item can be selected.

   @method select
   @param {Object|Integer} item The object or index to select
   @param {Object} [options] Expand or toggle the selection
   @param {Boolean} [options.toggle]
   If true, the item's selection state will be toggled.
   @param {Boolean} [options.range]
   If true, all items between the item and the cursor (inclusive) will be
   added to the selection.
   @chainable
   */
  select: function(item, options) {
    var end, indexOfCursor, range, retainSelection, selectionRange, start, targetIdx, toggle, _i, _results;
    options = options != null ? options : {};
    if (typeOf(item) === 'number') {
      item = this.objectAt(parseInt(item, 10));
    }
    toggle = get(options, 'toggle');
    range = get(options, 'range');
    retainSelection = get(options, 'retainSelection');
    if (toggle || range) {
      if (toggle) {
        if (this.inSelection(item)) {
          this.deselectObject(item);
        } else {
          this.selectObject(item);
        }
      } else if (range) {
        targetIdx = +this.indexOf(item);
        indexOfCursor = this.indexOfCursor();
        start = Math.min(targetIdx, indexOfCursor);
        end = Math.max(targetIdx, indexOfCursor);
        selectionRange = (function() {
          _results = [];
          for (var _i = start; start <= end ? _i <= end : _i >= end; start <= end ? _i++ : _i--){ _results.push(_i); }
          return _results;
        }).apply(this);
        this.selectObjects(selectionRange);
      }
    } else {
      Ember.beginPropertyChanges(this);
      if (!retainSelection) {
        this.deselectAll();
      }
      this.selectObject(item);
      Ember.endPropertyChanges(this);
    }
    return this;
  },

  /*
   Check an item to see if it can be selected.

   @method isSelectableObject
   @param {Mixed} obj The item to check
   @return {Boolean}
   */
  isSelectableObject: function(obj) {
    var type;
    type = typeOf(obj);
    return !!(obj && (type === 'instance' || type === 'object'));
  },

  /*
   Add an item to the selection.

   @method selectObject
   @param {Object|Integer} item The object or index to select
   @chainable
   */
  selectObject: function(item) {
    if (typeOf(item) === 'number') {
      item = this.objectAt(parseInt(item, 10));
    }
    if (this.isSelectableObject(item)) {
      get(this, '_selection').addObject(item);
      set(this, 'cursor', item);
    }
    return this;
  },

  /*
   Add multiple items to the selection.

   @method selectObjects
   @param {Array} items Items or indexes to select
   @chainable
   */
  selectObjects: function() {
    var item, items, _i, _len;
    items = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    items = [].concat.apply([], items);
    Ember.beginPropertyChanges(this);
    for (_i = 0, _len = items.length; _i < _len; _i++) {
      item = items[_i];
      this.selectObject(item);
    }
    Ember.endPropertyChanges(this);
    return this;
  },

  /*
   Add all items to the selection.

   @method selectAll
   @chainable
   */
  selectAll: function() {
    var _i, _ref, _results;
    this.selectObjects((function() {
      _results = [];
      for (var _i = 0, _ref = get(this, 'length'); 0 <= _ref ? _i < _ref : _i > _ref; 0 <= _ref ? _i++ : _i--){ _results.push(_i); }
      return _results;
    }).apply(this));
    return this;
  },

  /*
   Swap a selected item with another item. Useful if the content contains
   proxies or placeholders that must eventually be swapped.

   @method selectInstead
   @param {Object} current The item to replace
   @param {Object} replacement The new item
   @chainable
   */
  selectInstead: function(current, replacement) {
    if (this.inSelection(current)) {
      this.deselectObjects(current).selectObjects(replacement);
    }
    return this;
  },

  /*
   Alias to `deselectObject`.

   @method deselect
   @param {Object|Integer} item The item or indexes to remove from the selection
   @chainable
   */
  deselect: Ember.aliasMethod('deselectObjects'),

  /*
   Remove the specified item from the selection set.

   @method deselectObject
   @param {Object|Integer} item The item or indexes to remove from the selection
   @chainable
   */
  deselectObject: function(item) {
    if (typeOf(item) === 'number') {
      item = this.objectAt(parseInt(item, 10), true);
    }
    get(this, '_selection').removeObject(item);
    if (this.isSelectableObject(item)) {
      set(this, 'cursor', item);
    }
    return this;
  },

  /*
   Remove multiple items from the selection.

   @method deselectObjects
   @param {Array} items Items or indexes to deselect
   @chainable
   */
  deselectObjects: function() {
    var item, items, _i, _len;
    items = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    items = [].concat.apply([], items);
    Ember.beginPropertyChanges(this);
    for (_i = 0, _len = items.length; _i < _len; _i++) {
      item = items[_i];
      this.deselectObject(item);
    }
    Ember.endPropertyChanges(this);
    return this;
  },

  /*
   Clear the selection set.

   @method deselectAll
   @chainable
   */
  deselectAll: function() {
    get(this, '_selection').clear();
    return this;
  },

  /*
   Determine if a given object is present in the selection set.

   @method inSelection
   @param {Mixed} obj Object to search for
   @return {Boolean}
   */
  inSelection: function(obj) {
    return get(this, '_selection').contains(obj);
  },

  /*
   Remove all actively selected objects from the content array.

   @method removeSelection
   @chainable
   */
  removeSelection: function() {
    var selection;
    selection = get(this, 'selection');
    this.removeObjects(selection);
    this.deselectObjects(selection);
    return this;
  },

  /*
   Based on the arrangement of items in the content array, `indexOfSelection`
   creates an object with `first`, `last`, and `indexes` attributes.

   `first`:   The index of the selected item closest to the beginning of the
   content array.

   `last`:    The index of the selected item closest to the end of the
   content array.

   `indexes`: An array of integers representing each selected item's position
   in the content array.

   @example
   //Returned object
   {
   first: 3,
   last: 12,
   indexes: [5, 9, 12, 3, 10]
   }

   @method indexOfSelection
   @param content Array to search for current selection
   @return {Object|Boolean} `false` if nothing selected
   */
  indexOfSelection: function(content) {
    var idx, result, selected, selection, _i, _len;
    if (content == null) {
      content = get(this, 'arrangedContent').toArray();
    }
    result = {
      indexes: Ember.A(),
      first: null,
      last: null
    };
    selection = get(this, 'selection');
    if (selection.length === 0 || !Ember.isArray(content)) {
      return false;
    }
    for (_i = 0, _len = selection.length; _i < _len; _i++) {
      selected = selection[_i];
      idx = content.indexOf(selected);
      if ((result.first == null) || idx < result.first) {
        result.first = idx;
      }
      if ((result.last == null) || idx > result.last) {
        result.last = idx;
      }
      result.indexes.push(idx);
    }
    return result;
  },

  /*
   Move the selection forward from the last selected index.

   @method next
   @param {Boolean} expandSelection
   @param {Integer} count How far forward to move the selection
   @chainable
   */
  next: function(expandSelection, count) {
    var firstIdx, indices, itemsMod, len, targetIdx;
    if (expandSelection == null) {
      expandSelection = false;
    }
    if (count == null) {
      count = 1;
    }
    len = get(this, 'length');
    indices = this.indexOfSelection();
    firstIdx = +this.indexOf(get(this, 'firstSelectableObject'));
    if (indices) {
      targetIdx = indices.last + count;
      itemsMod = (len % count) || count;
      targetIdx = indices.last >= (len - itemsMod) ? indices.last : targetIdx;
      targetIdx = targetIdx >= len && targetIdx < (len + count) ? len - 1 : targetIdx;
    } else {
      targetIdx = firstIdx;
    }
    return this.select(this.objectAt(targetIdx), {
      range: expandSelection
    });
  },

  /*
   Move the selection back from the first selected index.

   @method previous
   @param {Boolean} expandSelection
   @param {Integer} count How far back to move the selection
   @chainable
   */
  previous: function(expandSelection, count) {
    var indices, lastIdx, len, targetIdx;
    if (expandSelection == null) {
      expandSelection = false;
    }
    if (count == null) {
      count = 1;
    }
    len = get(this, 'length');
    indices = this.indexOfSelection();
    lastIdx = +this.lastIndexOf(get(this, 'lastSelectableObject'));
    if (indices) {
      targetIdx = indices.first - count;
      targetIdx = indices.first < count ? indices.first : targetIdx;
    } else {
      targetIdx = lastIdx;
    }
    return this.select(this.objectAt(targetIdx), {
      range: expandSelection
    });
  },

  /*
   Find the position of the cursor object.

   @method indexOfCursor
   @return {Integer}
   */
  indexOfCursor: function() {
    return +this.indexOf(this.get('cursor'));
  },

  /*
   Hook for responding to impending updates to the selection set. Override to
   add custom handling for selection set updates.

   @method selectionSetWillChange
   */
  selectionSetWillChange: Ember.K,

  /*
   Hook for responding to updates to the selection set. Override to
   add custom handling for selection set updates.

   @method selectionSetDidChange
   */
  selectionSetDidChange: Ember.K,

  /*
   Hook for responding to the selection set being replaced with a different
   selection set instance. Override to add custom handling.

   @method selectionWillChange
   @param {Object} self
   */
  selectionWillChange: Ember.K,

  /*
   Hook for responding to the selection set being replaced with a different
   selection set instance. Override to add custom handling.

   @method selectionDidChange
   @param {Object} self
   */
  selectionDidChange: Ember.K,

  /*
   @private

   Handle a complete swap of the selection set.

   @method _selectionWillChange
   */
  _selectionWillChange: Ember.beforeObserver(function() {
    var len, selection;
    selection = get(this, '_selection');
    len = selection ? get(selection, 'length') : 0;
    this.selectionSetWillChange(this, 0, len, void 0);
    this.selectionWillChange(this);
    return this._teardownSelection(selection);
  }, '_selection'),

  /*
   @private

   Handle a complete swap of the selection set.

   @method _selectionDidChange
   */
  _selectionDidChange: Ember.observer(function() {
    var len, selection;
    selection = get(this, '_selection');
    len = selection ? get(selection, 'length') : 0;
    this._setupSelection(selection);
    this.selectionDidChange(this);
    return this.selectionSetDidChange(this, 0, void 0, len);
  }, '_selection'),

  /*
   @private

   Begin observing for updates to the selection set.

   @method _setupSelection
   */
  _setupSelection: function() {
    var selection;
    selection = get(this, '_selection');
    if (selection) {
      return selection.addEnumerableObserver(this, {
        willChange: 'selectionSetWillChange',
        didChange: 'selectionSetDidChange'
      });
    }
  },

  /*
   @private

   Discontinue observing of updates to the selection set.

   @method _setupSelection
   */
  _teardownSelection: function() {
    var selection;
    selection = get(this, '_selection');
    if (selection) {
      return selection.removeEnumerableObserver(this, {
        willChange: 'selectionSetWillChange',
        didChange: 'selectionSetDidChange'
      });
    }
  },

  /*
   Called before destruction of the host object.

   @method willDestroy
   */
  willDestroy: function() {
    this._super();
    return this._teardownSelection();
  }
});
/* jshint ignore:end */
