// function fibonacci(n) {
// 	return n <= 2 ? 1 : fibonacci(n - 1) + fibonacci(n - 2)
// }
// onmessage = function (e){
// 	console.log(this)
// 	const num = e.data
// 	console.log('子线程接收到主线程数据:', num)
// 	if(typeof num !== 'number') return
// 	const res = fibonacci(num)
// 	postMessage(res)
// 	console.log('子线程返回给主线程的数据:', res)
// }


self.addEventListener('message', function (e) {
	const  {data} = e;
	console.log(data)
	console.log(self.name)
	switch (data.cmd) {
		case 'start':
			self.postMessage('WORKER STARTED: ' + data.msg);
			break;
		case 'stop':
			self.postMessage('WORKER STOPPED: ' + data.msg);
			self.close(); // Terminates the worker.
			break;
		default:
			self.postMessage('Unknown command: ' + data.msg);
	}
}, false);
