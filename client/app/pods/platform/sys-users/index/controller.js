/**
 * Created by weiyang on 15-1-13.
 */
import Ember from 'ember';
import PagedArray from 'app/mixins/paged-array';
import SysUser from 'app/models/sys-user';

export default
Ember.ArrayController.extend(PagedArray(SysUser),{
  actions:{
    create:function(){
      this.store.filter('sysDict',function(dict){
        return dict.get('type')=='SYS_USER_STATUS';
      }).then(function(result){
          console.log(result);
        });
      this.transitionToRoute('platform.sysUsers.create');
    },
    detail: function (model) {
      this.transitionToRoute('platform.sysUsers.sysUser.detail', model);
    }
  }
});
