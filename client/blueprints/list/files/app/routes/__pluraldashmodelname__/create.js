/**
 * Created by weiyang on 15-1-13.
 */
import Ember from 'ember';

export default Ember.Route.extend({
  model:function(){
    return this.store.createRecord('<%=modelName%>');
  }
});
