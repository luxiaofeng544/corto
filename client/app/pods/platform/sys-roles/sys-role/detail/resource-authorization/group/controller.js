import Ember from 'ember';
import
{
  ManyRelationArray
}
from
'app/mixins/many-relation-array';
import SysGroup from 'app/models/sys-group';
import SysRoleRelation from 'app/models/sys-role-relation';
import SenderAction from 'app/mixins/sender-action';

export default
Ember.Controller.extend(ManyRelationArray(SysGroup,SysRoleRelation),SenderAction, {

});
