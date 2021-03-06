/**
 * Created by weiyang on 15-1-13.
 */
import Ember from 'ember';

export default
Ember.ObjectController.extend({
  actions:{
    back:function(){
      this.transitionToRoute('<%=pluralmodelname%>.index');
    },
    submit:function(){
      var model = this.get('model');
      if(model.get('isValid')){
        model.save().then(function(record){
          self.transitionToRoute('<%=modelName%>',record);
        });;
      }
    }
  }

});
