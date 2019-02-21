//todo create end of programm
var valid_registers = ['r0','r1','r2','r3','r4','r5','r6','r7'];
var valid_registers_result = valid_registers.slice(1);
var valid_instructions = ['noop', 'add', 'addi'];
var constant_values = [0,1,2,3,4,5,6,7,8,9];

var buf = {value:0, register_id:'r0'};
var pc_cont = document.getElementById("pc_countiner");
var instructions = [];
var enable_forward = false;

// start functions for instruction list creation
function delete_element(event) {
	var el = event.target.parentElement;
	el.remove();
}

function generate_instruction_list() {
	var instructions_local = [];
	var instruction_elements = document.getElementsByClassName('instruction-element');
	for (var i = 0; i < instruction_elements.length; i++) {
		var el = instruction_elements[i];
		instructions_local.push(generate_instruction_object(el));
	}
	instructions = instructions_local;

	document.getElementById('instruction-list-create').classList.toggle('hidden');
	document.getElementById('cpu-container').classList.toggle('hidden');
	return instructions_local;
}

function generate_instruction_object(element) {
	//var selects = element.childNodes;
	var selects = element.getElementsByClassName('instruction');
	var operation = selects[0].value;
	var instruction_object = {};
	instruction_object.operation = operation;
	var text_format = operation;
	if (operation !== 'noop') {
		instruction_object.result_register = selects[1].value;
		text_format = text_format + ' ' + instruction_object.result_register;
		instruction_object.operands = [];
		instruction_object.operands.push(selects[2].value);
		if (operation === 'add') {
			instruction_object.operands.push(selects[3].value);
		} else {
			instruction_object.operands.push(selects[4].value);
		}
		text_format = text_format + ', ' + instruction_object.operands.join(', ');
	}
	instruction_object.text_format = text_format;
	return instruction_object;
}

function instruction_changed(event) {
	var element = event.target;
	var instruction = element.value;
	var parentElement = element.parentElement;
	var to_hide = [];
	var to_show = [];
	if (instruction === 'noop') {
		to_hide.push(parentElement.getElementsByClassName('result-register'));
		to_hide.push(parentElement.getElementsByClassName('first-operand'));
		to_hide.push(parentElement.getElementsByClassName('second-operand'));
		to_hide.push(parentElement.getElementsByClassName('constant'));
	} else if (instruction === 'add') {
		to_show.push(parentElement.getElementsByClassName('result-register'));
		to_show.push(parentElement.getElementsByClassName('first-operand'));
		to_show.push(parentElement.getElementsByClassName('second-operand'));
		to_hide.push(parentElement.getElementsByClassName('constant'));
	} else if (instruction === 'addi') {
		to_show.push(parentElement.getElementsByClassName('result-register'));
		to_show.push(parentElement.getElementsByClassName('first-operand'));
		to_hide.push(parentElement.getElementsByClassName('second-operand'));
		to_show.push(parentElement.getElementsByClassName('constant'));
	}

	for (var i = to_show.length - 1; i >= 0; i--) {
		var el = to_show[i];
		el[0].classList.remove('hidden');
	}

	for (var i = to_hide.length - 1; i >= 0; i--) {
		var el = to_hide[i];
		el[0].classList.add('hidden');
	}
}

function add_new_instruction_select_element() {
	var new_element = document.createElement("DIV");
	new_element.className += 'instruction';
	new_element.className += ' instruction-element';
	innerHTML = '<div class="delete-button" onclick="delete_element(event)">X</div>';
	innerHTML += generate_select_instruction('instruction instruction-name', valid_instructions, 'instruction_changed');
	innerHTML += generate_select_instruction('instruction result-register hidden', valid_registers_result);
	innerHTML += generate_select_instruction('instruction first-operand hidden', valid_registers);
	innerHTML += generate_select_instruction('instruction second-operand hidden', valid_registers);
	innerHTML += generate_select_instruction('instruction constant hidden', constant_values);

	new_element.innerHTML = innerHTML;
	document.getElementById('instructions').appendChild(new_element);
}

function generate_select_instruction(name, elements, callback) {
	var select = '<select class="' + name + '"';
	if (callback) {
		select += ' onchange="' + callback + '(event)"';
	}

	select += '>';

	for (var i = 0; i < elements.length; i++) {
		var insr = elements[i];
		var option = '<option value="' + insr + '">' + insr + '</option>';
		select += option;
	}

	select += '</select>';
	return select;
}

// add one instruction at the begining
add_new_instruction_select_element();

//load example programm
function load_example() {
	instructions.push({
		operation: 'addi',
		result_register: 'r1',
		operands: ['r0', '1'],
		text_format: 'addi r1, r0, 1'});
	instructions.push({operation: 'noop', text_format: 'noop'});
	instructions.push({operation: 'noop', text_format: 'noop'});
	instructions.push({
		operation: 'addi',
		result_register: 'r2',
		operands: ['r0', '3'],
		text_format: 'addi r2, r0, 2'});
	instructions.push({operation: 'noop', text_format: 'noop'});
	instructions.push({operation: 'noop', text_format: 'noop'});
	instructions.push({
		operation: 'add',
		result_register: 'r3',
		operands: ['r1', 'r2'],
		text_format: 'add r3, r1, r2'});
	instructions.push({operation: 'noop', text_format: 'noop'});
	instructions.push({operation: 'noop', text_format: 'noop'});
	instructions.push({operation: 'noop', text_format: 'noop'});
	instructions.push({operation: 'noop', text_format: 'noop'});
}

function l(arg) {
	console.log(arg);
}

function takt() {
	var pc_value = get_pc();
	write_back(pc_value);
	memory_access(pc_value);
	execute_in_alu(pc_value);
	instruction_decode(pc_value);
	instruction_fetch(pc_value);
	change_pc();
}

var operation_functions = {
	add: function (operands) {
		return operands[0] + operands[1];
	},
	addi: function (operands) {
		return operation_functions.add(operands);
	},
	sub: function (operands) {
		return operands[0] - operands[1];
	},
	subi: function (operands) {
		return operation_functions.sub(operands);
	},
	mult: function (operands) {
		return operands[0] - operands[1];
	},
	div: function (operands) {
		return operands[0] - operands[1];
	}
}

function toggle_forward() {
	enable_forward = !enable_forward;
}

function reset_visualisation() {
	set_element_value("if-instruction-val", '');
	set_element_value("id-instruction-val", '');

	//reset all registers to 0
	for (var i = valid_registers.length - 1; i >= 0; i--) {
		var register = valid_registers[i];
		set_register(register, 0);
	}

	//reset alu elements
	var elements = document.getElementsByClassName('alu-element');
	for (var i = elements.length - 1; i >= 0; i--) {
		var e = elements[i];
		e.innerText = '';
	}

	set_element_value('pc_countiner', 0);
	set_element_value('instruction-fetch', '');
	set_element_value('instruction-decode', '');

	//reset buffer values
	buf.value = '0';
	buf.register_id = 'r0';
}

function change_pc() {
	var current_pc = get_element_value('pc_countiner');
	if (current_pc < instructions.length) {
		current_pc++;
		set_element_value('pc_countiner', current_pc);
	} else {
		alert('end');
	}
}

function get_pc() {
	return get_element_value('pc_countiner');
}

function get_element_value(element_name) {
	var result = '';
	if (element_name !== '') {
		var element = document.getElementById(element_name)
		if (element) {
			result = element.innerText;
		}
	}
	return result;
}

function set_element_value(element_name, value) {
	if (element_name !== '') {
		document.getElementById(element_name).innerText = value;
	}
}

function get_register(register) {
	if (! valid_registers.includes(register)){
		return 0;
	}
	var reg_addr = 'reg_cell-' + register;
	return get_element_value(reg_addr);
}

function set_register(register, value) {
	if (! valid_registers.includes(register)){
		return 0;
	}

	if (isNaN(value)) {
		return 0;
	}
	var reg_addr = 'reg_cell-' + register;
	set_element_value(reg_addr, value);
}

// if first char is r then this is register
function is_register(register_name) {
	return register_name.charAt(0) === 'r';
}

function is_valid_register(register_name) {
	return valid_registers.indexOf(register_name) !== -1;
}

function write_back(pc_value) {
	if (is_valid_register(buf.register_id) && buf.register_id != 'r0') {
		set_register(buf.register_id, buf.value);
	}
}

function memory_access(pc_value) {
	buf.value = get_element_value('alu-result_value');
	buf.register_id = get_element_value('alu-result_register');

	if (buf.value == '') {
		buf.value = 0;
	}
	if (buf.register_id == '') {
		buf.register_id = 'r0';
	}
}

function execute_in_alu(pc_value) {
	pc_value -= 2;
	if (pc_value < 0) {
		return 0;
	}

	var current_instruction = instructions[pc_value];
	l(current_instruction);
	set_element_value('alu-operation', current_instruction.operation);
	if (current_instruction.operation !== 'noop') {
		set_element_value('alu-result_register', current_instruction.result_register);
		set_element_value('alu-first_operand', current_instruction.operands[0]);
		set_element_value('alu-second_operand', current_instruction.operands[1]);
		var operation_result = operation_functions[current_instruction.operation](current_instruction.decoded_operands);
		l(operation_result);
		set_element_value('alu-result_value', operation_result);
	} else {
		set_element_value('alu-result_register', '');
		set_element_value('alu-first_operand', '');
		set_element_value('alu-second_operand', '');
		set_element_value('alu-result_value', '');
	}
}

function get_result_from_alu() {
	return get_element_value('alu-result_value');
}

function get_register_for_decode(current_instruction_number, register) {
	var register_value = get_register(register);
	l('register ' + register + ' is ' + register_value);
	if (enable_forward && register !== 'r0') {
		var prev_instr = instructions[current_instruction_number-1];
		if (prev_instr && prev_instr.operands) {
			if (prev_instr.result_register === register) {
				register_value = get_result_from_alu();
			}
		}

		if (buf.register_id === register) {
			register_value = buf.value;
		}
	}

	return Number(register_value);
}

function instruction_decode(pc_value) {
	pc_value -= 1;
	if (pc_value < 0) {
		return 0;
	}

	var current_instruction = instructions[pc_value];
	var display_format = current_instruction.operation;
	if (current_instruction.result_register) {
		display_format = display_format + ' ' + current_instruction.result_register;
	}
	if (current_instruction.operands) {
		current_instruction.decoded_operands = [];
		for (var i = 0; i < current_instruction.operands.length; i++) {
			var operand = current_instruction.operands[i];
			if (is_valid_register(operand)) {
				var register_value = get_register_for_decode(pc_value, operand);
				current_instruction.decoded_operands.push(Number(register_value));
				display_format = display_format + ', ' + operand + '(' + register_value + ')';
			} else if (! isNaN(operand)) {
				current_instruction.decoded_operands.push(Number(operand));
				display_format = display_format + ', ' + operand;
			}
		}
	}

	set_element_value('instruction-decode', display_format);
	set_element_value('id-instruction-val', pc_value);
}

function instruction_fetch(pc_value) {
	var current_instruction = instructions[pc_value];
	if (current_instruction) {
		set_element_value('instruction-fetch', current_instruction.text_format);
		set_element_value('if-instruction-val', pc_value);
	} else {
		set_element_value('instruction-fetch', '');
		set_element_value('if-instruction-val', '');
	}
}