import { LightningElement, track, wire } from 'lwc';
import getTasks from '@salesforce/apex/ToDoListController.getTasks'; 
import {refreshApex} from '@salesforce/apex';
import insertTask from '@salesforce/apex/ToDoListController.insertTask';
import deleteTask from '@salesforce/apex/ToDoListController.deleteTask';

export default class ToDo extends LightningElement {

    @track
    todoTasks = [];
    todoTasksResponse;
    
    newTask ='';
    processing = true;
    renderText = true;

    updateNewTask(event){
        this.newTask='';
        this.newTask = event.target.value;
    }

    addTaskToList(event){
        // push - used to add element at the end of an array------
        // unshift -used to add element at the start of the array
        
        if(this.newTask == ''){
            return;
        }
        this.processing=true;
        insertTask({subject : this.newTask})
        .then(result => {
            console.log(result);
            this.todoTasks.push({
                id:this.todoTasks[this.todoTasks.length - 1] ? this.todoTasks[this.todoTasks.length - 1].id + 1: 0,
                name : this.newTask,
                recordId : result.Id
            }); 
            this.newTask='';
        })
        .catch(error => console.log(error))
        .finally(()=> this.processing = false);
        
    }
   

    deleteTask(event){
        let idToDelete = event.target.name ;
        let todoTasks = this.todoTasks;
        let todoTaskIndex;
        let recordIdToDelete;
        this.processing=true;

        //Method 1
        for(let i =0; i<todoTasks.length; i++){
            if(idToDelete === todoTasks[i].id){
                todoTaskIndex = i;
            }
        }

        recordIdToDelete = todoTasks[todoTaskIndex].recordId;
        
        deleteTask({recordId : recordIdToDelete})
        .then(result =>{
            console.log(result);
            if(result){
                todoTasks.splice(todoTaskIndex,1);
            }
            else{
                console.log('-------------Unable to Delete the Task---------------');
            }
             
        })
        .catch(error => console.log(error))
        .finally(()=> this.processing=false);

        //Method 2
       /* todoTasks.splice(
            todoTasks.findIndex(function(todoTask) {
            return todoTask.id === idToDelete;
            }),1
        );*/

        //Method 3
        //todoTasks.splice(todoTasks.findIndex (todoTask => todoTask.id === idToDelete),1);

    }

    @wire(getTasks)
    getTodoTasks(response){
        this.todoTasksResponse = response;
        let data =response.data;
        let error =response.error;
        if(data || error){
            this.processing=false;
        }

        if(data){
            this.todoTasks = [];
            data.forEach(task => {
                this.todoTasks.push({
                    id: this.todoTasks.length + 1,
                    name: task.Subject,
                    recordId: task.Id
                });
            });
            console.log(this.todoTasks);
        }
        else if(error){
            console.log(error +' Error');
        }
    }
    refreshTodoList(){
        this.processing=true;
        refreshApex(this.todoTasksResponse)
        .finally(() =>  this.processing=false);
    }

}