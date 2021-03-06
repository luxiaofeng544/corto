/**
 * Created by weiyang on 15-1-19.
 */
import Ember from 'ember';
import ColumnDefinition from 'ember-cli-ember-table/column-definition';
import ExcludePagedArray from 'app/mixins/exclude-paged-array';
import Util from 'ember-cli-pagination/util';

export default
Ember.Controller.extend(Ember.PromiseProxyMixin,{
  init: function () {
    this._super();
    this.set('selection', Ember.A());
  },
  loadBefore: function () {
    var selection = this.get('selection');
    selection.clear();
  },
  /**
   * modal list controller
   * always trigger by other controller
   * 1.so need to do some action when other trigger to open it      : sendEvent open on open modal
   * 2.and after do something on modal ,need to notify the trigger  : save trigger source
   * 3.how to send args from trigger source to modal list when open the modal
   */
  loadData: function (modelType) {
    var setted = this.get('modelType');
    if (!setted) {
      Ember.assert('The list dialog need modelType to request', modelType);
      this.set('modelType', modelType);
    } else if (setted && modelType && setted != modelType) {
      this.set('modelType', modelType);
    }

    modelType = modelType || setted;
    this.loadBefore();
    //TODO get args from sender
    //TODO use QueryParamsForBackend ?
    var triggerSource = this.get('triggerSource');
    var args = Ember.tryInvoke(triggerSource,'queryParams');
    var params = {
      filter: {
        type: 'sysUser',
        id: 1
      }
    };
    var mainOps = {
      page: params.page || this.get('startingPage'),
      perPage: params.perPage || this.get('perPage'),
      modelName: modelType.typeKey,
      store: this.store
    };

    if (params.paramMapping) {
      mainOps.paramMapping = params.paramMapping;
    }

    var otherOps = Util.paramsOtherThan(params, ["page", "perPage", "paramMapping"]);
    mainOps.otherParams = otherOps;

    mainOps.initCallback = Ember.K;

    this.set('content', ExcludePagedArray.create(mainOps));

    this.loadAfter();

  }.on('open'),
  loadAfter: Ember.K,
  columns: function () {
    var model = this.get('modelType');
    return model.subsetDefinitions;
  }.property('modelType'),

  triggerSource: null,
  startingPage: 1,
  page: 1,
  perPage: 10,
  limit: Ember.computed.alias('perPage'),
  pageBinding: 'content.page',
  perPageBinding: 'content.perPage',
  totalPagesBinding: 'content.totalPages',
  actions: {
    ensure: function () {
      var triggerSource = this.get('triggerSource');
      var selection = this.get('selection');
      if (triggerSource && selection.length > 0) {
        //TODO low to high can get the sender
        //TODO but from high to low can't get the sender
        triggerSource.send('ensure', selection, this);
      }
    },
    refresh: function () {
      this.loadData();
    }
  }
});
//TODO design before and after hook
