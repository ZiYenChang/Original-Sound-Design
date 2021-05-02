registerProcessor('noise-generator', class extends AudioWorkletProcessor{
  process(inputs, outputs){
    for (let i=0; i<outputs[0][0].length;++i){
      outputs[0][0][i]=2*Math.random()-1;
    }
      return true;
  }
});

//to replace gain node
registerProcessor('gain-processor', class extends AudioWorkletProcessor{
  //custom AudioParams can be defned with this static getter
  static get parameterDescriptors(){
    return[{name:'gain', defaultValue:0.1}]
  }
  process(inputs, outputs, parameters){
    const input = inputs[0], output = outputs[0];
    for(let channel=0; channel<inputs[0].length; ++channel){
      for (let i=0; i<input[channel].length; ++i){
        output[channel][i] = input[channel][i]* parameters.gain[0];
      } // end i loop
    } //end channel loop
    return true;
  }
});
