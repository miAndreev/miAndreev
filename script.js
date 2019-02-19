//todo create end of programm
var valid_registers = ['r0','r1','r2','r3','r4','r5','r6','r7'];
var valid_instructions = ['noop', 'add', 'addi'];

var buf = {value:0, register_id:'r0'};
var pc_cont = document.getElementById("pc_countiner");
var instructions = [];

function init_fkt() {
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

init_fkt();

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
		l(operands);
		return operands[0] + operands[1]
	},
	addi: function (operands) {
		l(operands);
		return operands[0] + operands[1]
	}
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
	}
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
				var register_value = get_register(operand);
				l('register ' + operand + ' is ' + register_value);
				current_instruction.decoded_operands.push(Number(register_value));
				l(current_instruction.decoded_operands);
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
