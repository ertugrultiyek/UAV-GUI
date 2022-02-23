var veri = [0,0,0,0,0,0,0,0,0,0,0,0,0];

document.addEventListener('DOMContentLoaded', () =>{

	const connectButton = document.getElementById("connectButton");

	connectButton.addEventListener("click",connect);

	var data = "";

	async function connect(){
		const port = await navigator.serial.requestPort();



		await port.open({
			"baudRate" : "9600",
			"bufferSize":"10240"
		});

	//	console.log(port);
		const reader = port.readable.getReader();

		let utf8Encode = new TextEncoder();


		while (true) {
		  const { value, done } = await reader.read();
		  if (done) {

		    reader.releaseLock();
		    break;
		  }

			if(value.length === 32)

				data = value;
			else if(value.length === 20){

				data = new Uint8Array([data[0], data[1], data[2], data[3],
					data[4], data[5], data[6], data[7],
					data[8], data[9], data[10], data[11],
					data[12], data[13], data[14], data[15],
					data[16], data[17], data[18], data[19],
					data[20], data[21], data[22], data[23],
					data[24], data[25], data[26], data[27],
					data[28], data[29], data[30], data[31],
					value[0], value[1], value[2], value[3],
					value[4], value[5], value[6], value[7],
					value[8], value[9], value[10], value[11],
					value[12], value[13], value[14], value[15],
					value[16], value[17], value[18], value[19],
				]);
			}else {
				//console.error("err");
			}

			for (var i = 0; i < data.length; i+=4){

				var bData = new Uint8Array([data[i+3], data[i+2], data[i+1], data[i]]);

				var buf = new ArrayBuffer(4);
				var view = new DataView(buf);

				bData.forEach(function (b, i) {
				    view.setUint8(i, b);
				});
				var num = view.getFloat32(0);
				veri[i/4] = num //console.log(num);
			}
			console.log(veri);
			attitudeIndicator.updateValues(veri[1], veri[0]);
			headingIndicator.angle = veri[2]; // yaw
			speedGauge.setValue(veri[3]);
			vsiGauge.setValue(veri[4]);
			altitudeGauge.setValue(veri[5]);
			batteryGauge.setValue(veri[8]);
			

		}//endWhile



		//----------------------------------------------------------------
	 }
});
