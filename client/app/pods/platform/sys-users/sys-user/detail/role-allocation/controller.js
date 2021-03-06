/**
 * Created by weiyang on 15-1-13.
 */
import Ember from 'ember';
import SysRole from 'app/models/sys-role';

export default
Ember.ArrayController.extend({
  modelType:SysRole,
  actions:{
    clearRelationship: function (relation, role) {
      relation.destroyRecord().then(function(){
        var relationTypes = role.get('relationTypes');
        var idx = relationTypes.indexOf(relation);
        relationTypes.replace(idx, 1,[null]);
      });
    }
  }
});
