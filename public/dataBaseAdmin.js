$('.test-btn').click( function(){
    $.post({
        url: '/api/lents',
        data: {
            link: $('.title').val()
        },
        success: function (data) {
            console.log(data);
        }
    })
})
$('.send-btn').click( ()=>{
    $.post({
        url: '/api/users',
        data: {
            name: $('.title').val(),
            password: $('.desc').val()
        },
        success: (data)=> {
            console.log(data)
        }
    })

})

$('.addlent-btn').click( ()=> {
    $.ajax({
        url: '/api/users/lents',
        type: 'PUT',
        data: {
            name: $('.title').val(),
            password: $('.desc').val(),
            link: $('.price').val()
        },
        success: (data) => {
            console.log(data)
        }
    })
})

$('.dellent-btn').click( ()=> {
    $.ajax({
        url: '/api/users/feeds',
        type: 'DELETE',
        data: {
            name: $('.title').val(),
            password: $('.desc').val(),
            feed: $('.price').val()
        },
        success: (data) => {
            console.log(data)
        }
    })
})
