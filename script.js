document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('.needs-validation');
    const dataNascimentoInput = document.getElementById('nascimento');
    const responsavelSection = document.getElementById('responsavel-legal-section');

    // Mapeamento de campos e suas funções de validação específicas
    const validationMap = {
        'cpf': validateCPF,
        'email': validateEmail,
        'telefone': validatePhone
    };

    // Campos do Solicitante Principal (para facilitar o acesso e a validação)
    const mainFields = {
        name: document.getElementById('name'),
        nascimento: dataNascimentoInput,
        rg: document.getElementById('rg'),
        cpf: document.getElementById('cpf'),
        telefone: document.getElementById('telefone'),
        email: document.getElementById('email'),
        // Novos campos de endereço
        cep: document.getElementById('cep-input'),
        logradouro: document.getElementById('logradouro'),
        numero: document.getElementById('numero'),
        complemento: document.getElementById('complemento'),
        bairro: document.getElementById('bairro'),
        localidade: document.getElementById('localidade'),
        uf: document.getElementById('uf'),

        sexoMasculino: document.getElementById('masculino'),
        sexoFeminino: document.getElementById('feminino')
    };

    // Campos do Responsável Legal (todos os inputs e radio buttons)
    const respFields = [
        document.getElementById('resp-name'),
        document.getElementById('resp-nascimento'),
        document.getElementById('resp-rg'),
        document.getElementById('resp-cpf'),
        document.getElementById('resp-telefone'),
        document.getElementById('resp-email'),
        document.getElementById('resp-cep-input'),
        document.getElementById('resp-logradouro'),
        document.getElementById('resp-numero'),
        document.getElementById('resp-complemento'),
        document.getElementById('resp-bairro'),
        document.getElementById('resp-localidade'),
        document.getElementById('resp-uf'),
        document.getElementById('resp-raca'),
        ...document.querySelectorAll('input[name="resp-sexo"]')
    ];

    // Mapeamento dos campos de endereço do RESPONSÁVEL para uso nas funções de CEP
    const respAddressFields = {
        logradouro: document.getElementById('resp-logradouro'),
        numero: document.getElementById('resp-numero'),
        complemento: document.getElementById('resp-complemento'),
        bairro: document.getElementById('resp-bairro'),
        localidade: document.getElementById('resp-localidade'),
        uf: document.getElementById('resp-uf')
    };


    // --- Funções de Validação ---

    function validateCPF(cpf) {
        if (!cpf) return false;
        cpf = cpf.replace(/[^\d]+/g, '');
        if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
        let sum = 0;
        let remainder;
        for (let i = 1; i <= 9; i++) { sum = sum + parseInt(cpf.substring(i - 1, i)) * (11 - i); }
        remainder = (sum * 10) % 11;
        if ((remainder === 10) || (remainder === 11)) remainder = 0;
        if (remainder !== parseInt(cpf.substring(9, 10))) return false;
        sum = 0;
        for (let i = 1; i <= 10; i++) { sum = sum + parseInt(cpf.substring(i - 1, i)) * (12 - i); }
        remainder = (sum * 10) % 11;
        if ((remainder === 10) || (remainder === 11)) remainder = 0;
        if (remainder !== parseInt(cpf.substring(10, 11))) return false;
        return true;
    }

    function validateEmail(email) {
        if (!email) return false;
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    }

    function validatePhone(phone) {
        if (!phone) return false;
        const cleanedPhone = phone.replace(/[^\d]+/g, '');
        // Validação de 11 a 12 dígitos para incluir DDD e números completos
        // (Ex: (XX) XXXXX-XXXX ou (XX) XXXX-XXXX)
        return cleanedPhone.length >= 10 && cleanedPhone.length <= 11; // 10 dígitos para DDD + 8/9 dígitos, 11 para DDD + 9 dígitos
    }

    // --- Funções de Ajuda para Validação de UI (Bootstrap) ---

    function setValidationState(inputElement, isValid) {
        if (!inputElement) return;
        if (isValid) {
            inputElement.classList.remove('is-invalid');
            inputElement.classList.add('is-valid');
        } else {
            inputElement.classList.remove('is-valid');
            inputElement.classList.add('is-invalid');
        }
    }

    function validateAndSetState(inputElement, validatorFunction) {
        if (!inputElement) return true;
        if (!inputElement.hasAttribute('required') && !inputElement.value) {
            inputElement.classList.remove('is-valid', 'is-invalid');
            return true;
        }
        const isValid = validatorFunction(inputElement.value);
        setValidationState(inputElement, isValid);
        return isValid;
    }

    // --- Lógica de Idade e Campos do Responsável ---

    function calcularIdade(dataNasc) {
        const hoje = new Date();
        const nascimento = new Date(dataNasc);
        let idade = hoje.getFullYear() - nascimento.getFullYear();
        const mes = hoje.getMonth() - nascimento.getMonth();

        if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
            idade--;
        }
        return idade;
    }

    function toggleResponsavelFields() {
        const dataNascimento = dataNascimentoInput.value;
        let isMinor = false;

        if (dataNascimento) {
            const idade = calcularIdade(dataNascimento);
            isMinor = idade < 18;
        }

        if (isMinor) {
            responsavelSection.style.display = 'block';
            respFields.forEach(field => {
                if (field && !field.readOnly) {
                    field.setAttribute('required', 'true');
                    field.classList.remove('is-valid', 'is-invalid');
                }
            });
            const respSexoRadios = document.querySelectorAll('input[name="resp-sexo"]');
            if (respSexoRadios.length > 0) {
                respSexoRadios[0].setAttribute('required', 'true');
                respSexoRadios.forEach(radio => radio.classList.remove('is-valid', 'is-invalid'));
            }
            const respRacaSelect = document.getElementById('resp-raca');
            if (respRacaSelect) {
                respRacaSelect.setAttribute('required', 'true');
                respRacaSelect.classList.remove('is-valid', 'is-invalid');
            }
        } else {
            responsavelSection.style.display = 'none';
            respFields.forEach(field => {
                if (field) {
                    field.removeAttribute('required');
                    if (field.type !== 'radio' && !field.readOnly) {
                        field.value = '';
                    } else if (field.type === 'radio') {
                        field.checked = false;
                    }
                    field.classList.remove('is-valid', 'is-invalid');
                }
            });
            // Garante que os campos de endereço do responsável estejam vazios e desabilitados
            setAddressFieldsState(respAddressFields, '', true, true);
            document.getElementById('resp-cep-input').value = ''; // Limpa o CEP do responsável
        }
    }

    // --- Função Auxiliar para formatar data de nascimento para a API ---
    function formatBirthDateForApi(dateString) {
        if (!dateString) return '';
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
    }

    // --- NOVAS FUNÇÕES: PREENCHIMENTO DE ENDEREÇO POR CEP ---

    /**
     * Define o estado (valor, disabled, validação visual) dos campos de endereço.
     * @param {Object} fields Objeto contendo referências aos campos de endereço.
     * @param {string|Object} data Se string, será o valor para limpar. Se objeto, são os dados da ViaCEP.
     * @param {boolean} isDisabled Define se os campos devem ser desabilitados (aplica apenas aos auto-preenchidos).
     * @param {boolean} removeValidationState Se true, remove as classes is-valid/is-invalid.
     */
    function setAddressFieldsState(fields, data, isDisabled, removeValidationState = false) {
        const isObjectData = typeof data === 'object';

        // Campos que são auto-preenchidos e desabilitados
        const autoFillFields = [fields.logradouro, fields.bairro, fields.localidade, fields.uf];
        autoFillFields.forEach(field => {
            if (field) {
                field.value = isObjectData ? (data[field.id.split('-').pop()] || '') : data;
                field.disabled = isDisabled;
                if (removeValidationState) field.classList.remove('is-valid', 'is-invalid');
            }
        });

        // Campos que são sempre manuais (número e complemento)
        // Eles são limpos quando CEP é alterado, mas permanecem habilitados para edição manual.
        if (fields.numero) {
            if (!isObjectData) fields.numero.value = data; // Limpa se data for string vazia
            fields.numero.disabled = false; // Sempre habilitado para número
            if (removeValidationState) fields.numero.classList.remove('is-valid', 'is-invalid');
        }
        if (fields.complemento) {
            fields.complemento.value = isObjectData ? (data.complemento || '') : data; // Pré-popula se ViaCEP fornecer
            fields.complemento.disabled = false; // Sempre habilitado para complemento
            if (removeValidationState) fields.complemento.classList.remove('is-valid', 'is-invalid');
        }
    }


    /**
     * Busca o endereço na ViaCEP API e preenche/desabilita os campos.
     * @param {HTMLElement} cepInput O elemento input do CEP.
     * @param {Object} addressFields Objeto com referências aos campos de endereço correspondentes.
     */
    async function fetchAddressByCep(cepInput, addressFields) {
        const cep = cepInput.value.replace(/\D/g, ''); // Remove caracteres não numéricos

        // Limpa e habilita os campos sempre que um novo CEP é digitado
        setAddressFieldsState(addressFields, '', false, true);

        if (cep.length !== 8) {
            setValidationState(cepInput, false);
            return;
        }

        try {
            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const data = await response.json();

            if (data.erro) {
                setAddressFieldsState(addressFields, '', false, false); // Vazio, Habilitado, Manter Validação Visual para erro
                setValidationState(cepInput, false);
                alert('CEP não encontrado.');
            } else {
                setAddressFieldsState(addressFields, data, true); // Preenche e desabilita os que devem ser automáticos
                setValidationState(cepInput, true);
                setValidationState(addressFields.logradouro, true);
                setValidationState(addressFields.bairro, true);
                setValidationState(addressFields.localidade, true);
                setValidationState(addressFields.uf, true);
            }
        } catch (error) {
            console.error('Erro ao buscar CEP:', error);
            setAddressFieldsState(addressFields, '', false, false); // Vazio, Habilitado, Manter Validação Visual para erro
            setValidationState(cepInput, false);
            alert('Erro ao consultar o CEP. Tente novamente.');
        }
    }

    // --- Event Listeners para validação "ao digitar" ou "ao sair do campo" ---

    mainFields.cpf.addEventListener('blur', function () {
        validateAndSetState(this, validationMap.cpf);
    });
    mainFields.nascimento.addEventListener('change', function () {
        // Lógica de idade pode ser adicionada aqui se fetchCPFData não for usada
    });

    mainFields.email.addEventListener('input', function () {
        validateAndSetState(this, validationMap.email);
    });
    mainFields.telefone.addEventListener('input', function () {
        validateAndSetState(this, validationMap.telefone);
    });

    // Listener para o CEP do solicitante principal
    mainFields.cep.addEventListener('blur', function () {
        fetchAddressByCep(mainFields.cep, {
            logradouro: mainFields.logradouro,
            numero: mainFields.numero,
            complemento: mainFields.complemento,
            bairro: mainFields.bairro,
            localidade: mainFields.localidade,
            uf: mainFields.uf
        });
    });
    mainFields.cep.addEventListener('input', function() {
        let value = this.value.replace(/\D/g, '');
        if (value.length > 5) {
            value = value.substring(0, 5) + '-' + value.substring(5, 8);
        }
        this.value = value;
        this.classList.remove('is-valid', 'is-invalid');
        setAddressFieldsState({
            logradouro: mainFields.logradouro,
            numero: mainFields.numero,
            complemento: mainFields.complemento,
            bairro: mainFields.bairro,
            localidade: mainFields.localidade,
            uf: mainFields.uf
        }, '', false, true);
    });


    // Listeners para os campos do responsável legal
    document.getElementById('resp-cpf').addEventListener('blur', function () {
        validateAndSetState(this, validationMap.cpf);
    });
    document.getElementById('resp-nascimento').addEventListener('change', function () {
        // Lógica de idade para responsável pode ser adicionada aqui
    });

    document.getElementById('resp-email').addEventListener('input', function () {
        validateAndSetState(this, validationMap.email);
    });
    document.getElementById('resp-telefone').addEventListener('input', function () {
        validateAndSetState(this, validationMap.telefone);
    });

    const respCepInput = document.getElementById('resp-cep-input');
    respCepInput.addEventListener('blur', function () {
        fetchAddressByCep(respCepInput, respAddressFields);
    });
    respCepInput.addEventListener('input', function() {
        let value = this.value.replace(/\D/g, '');
        if (value.length > 5) {
            value = value.substring(0, 5) + '-' + value.substring(5, 8);
        }
        this.value = value;
        this.classList.remove('is-valid', 'is-invalid');
        setAddressFieldsState(respAddressFields, '', false, true);
    });

    // Listener para a data de nascimento do solicitante principal (para mostrar/esconder a seção do responsável)
    dataNascimentoInput.addEventListener('change', toggleResponsavelFields);

    // URL do seu endpoint de backend
    const backendUrl = 'http://localhost:3000/api/submit-form'; // ATUALIZE ESTA URL QUANDO FIZER O DEPLOY


    // --- Validação no Submit do Formulário (Bootstrap + Validações Customizadas) ---

    form.addEventListener('submit', async function (event) {
        event.preventDefault();
        event.stopPropagation();

        let formIsValid = true;

        if (!form.checkValidity()) {
            formIsValid = false;
        }

        // Validações principais do solicitante
        if (mainFields.cpf.hasAttribute('required') && !validateAndSetState(mainFields.cpf, validationMap.cpf)) formIsValid = false;
        if (mainFields.email.hasAttribute('required') && !validateAndSetState(mainFields.email, validationMap.email)) formIsValid = false;
        if (mainFields.telefone.hasAttribute('required') && !validateAndSetState(mainFields.telefone, validationMap.telefone)) formIsValid = false;

        // Validação dos campos de endereço do solicitante
        if (mainFields.cep.hasAttribute('required') && !mainFields.cep.value) setValidationState(mainFields.cep, false, formIsValid = false); else if (mainFields.cep.value.length === 9) setValidationState(mainFields.cep, true);
        if (mainFields.logradouro.hasAttribute('required') && !mainFields.logradouro.value) setValidationState(mainFields.logradouro, false, formIsValid = false);
        if (mainFields.numero.hasAttribute('required') && !mainFields.numero.value) setValidationState(mainFields.numero, false, formIsValid = false);
        if (mainFields.bairro.hasAttribute('required') && !mainFields.bairro.value) setValidationState(mainFields.bairro, false, formIsValid = false);
        if (mainFields.localidade.hasAttribute('required') && !mainFields.localidade.value) setValidationState(mainFields.localidade, false, formIsValid = false);
        if (mainFields.uf.hasAttribute('required') && !mainFields.uf.value) setValidationState(mainFields.uf, false, formIsValid = false);

        const sexoRadios = document.querySelectorAll('input[name="sexo"]');
        const isSexoChecked = Array.from(sexoRadios).some(radio => radio.checked);
        if (!isSexoChecked && sexoRadios.length > 0 && sexoRadios[0].hasAttribute('required')) {
            sexoRadios.forEach(radio => radio.classList.add('is-invalid'));
            formIsValid = false;
        } else { sexoRadios.forEach(radio => radio.classList.remove('is-invalid')); }
        const racaSelect = document.getElementById('raca');
        if (racaSelect.hasAttribute('required') && !racaSelect.value) setValidationState(racaSelect, false, formIsValid = false); else if (racaSelect.hasAttribute('required')) setValidationState(racaSelect, true);


        if (responsavelSection.style.display === 'block') {
            const respCpfInput = document.getElementById('resp-cpf');
            const respEmailInput = document.getElementById('resp-email');
            const respTelefoneInput = document.getElementById('resp-telefone');
            const respNascimentoInput = document.getElementById('resp-nascimento');

            if (respCpfInput.hasAttribute('required') && !validateAndSetState(respCpfInput, validationMap.cpf)) formIsValid = false;
            if (respNascimentoInput.hasAttribute('required') && !respNascimentoInput.value) setValidationState(respNascimentoInput, false, formIsValid = false); else if (respNascimentoInput.hasAttribute('required')) setValidationState(respNascimentoInput, true);
            if (respEmailInput.hasAttribute('required') && !validateAndSetState(respEmailInput, validationMap.email)) formIsValid = false;
            if (respTelefoneInput.hasAttribute('required') && !validateAndSetState(respTelefoneInput, validationMap.telefone)) formIsValid = false;

            // Validação dos campos de endereço do responsável legal
            const respCepInput = document.getElementById('resp-cep-input');
            const respLogradouro = document.getElementById('resp-logradouro');
            const respNumero = document.getElementById('resp-numero');
            const respBairro = document.getElementById('resp-bairro');
            const respLocalidade = document.getElementById('resp-localidade');
            const respUf = document.getElementById('resp-uf');
            const respRacaSelect = document.getElementById('resp-raca');


            if (respCepInput.hasAttribute('required') && !respCepInput.value) setValidationState(respCepInput, false, formIsValid = false); else if (respCepInput.value.length === 9) setValidationState(respCepInput, true);
            if (respLogradouro.hasAttribute('required') && !respLogradouro.value) setValidationState(respLogradouro, false, formIsValid = false);
            if (respNumero.hasAttribute('required') && !respNumero.value) setValidationState(respNumero, false, formIsValid = false);
            if (respBairro.hasAttribute('required') && !respBairro.value) setValidationState(respBairro, false, formIsValid = false);
            if (respLocalidade.hasAttribute('required') && !respLocalidade.value) setValidationState(respLocalidade, false, formIsValid = false);
            if (respUf.hasAttribute('required') && !respUf.value) setValidationState(respUf, false, formIsValid = false);

            const respSexoRadios = document.querySelectorAll('input[name="resp-sexo"]');
            const isRespSexoChecked = Array.from(respSexoRadios).some(radio => radio.checked);
            if (!isRespSexoChecked && respSexoRadios.length > 0 && respSexoRadios[0].hasAttribute('required')) {
                respSexoRadios.forEach(radio => radio.classList.add('is-invalid'));
                formIsValid = false;
            } else { respSexoRadios.forEach(radio => radio.classList.remove('is-invalid')); }

            if (respRacaSelect.hasAttribute('required') && !respRacaSelect.value) setValidationState(respRacaSelect, false, formIsValid = false); else if (respRacaSelect.hasAttribute('required')) setValidationState(respRacaSelect, true);
        }

        if (!formIsValid) {
            form.classList.add('was-validated');
            return;
        }

        form.classList.add('was-validated');

        const formData = {
            cpf: mainFields.cpf.value,
            nascimento: mainFields.nascimento.value,
            rg: mainFields.rg.value,
            name: mainFields.name.value,
            telefone: mainFields.telefone.value,
            email: mainFields.email.value,
            cep: mainFields.cep.value,
            logradouro: mainFields.logradouro.value,
            numero: mainFields.numero.value,
            complemento: mainFields.complemento.value,
            bairro: mainFields.bairro.value,
            localidade: mainFields.localidade.value,
            uf: mainFields.uf.value,
            sexo: document.querySelector('input[name="sexo"]:checked')?.value || '',
            raca: document.getElementById('raca').value
        };

        if (responsavelSection.style.display === 'block') {
            formData['resp-name'] = document.getElementById('resp-name').value;
            formData['resp-nascimento'] = document.getElementById('resp-nascimento').value;
            formData['resp-rg'] = document.getElementById('resp-rg').value;
            formData['resp-cpf'] = document.getElementById('resp-cpf').value;
            formData['resp-telefone'] = document.getElementById('resp-telefone').value;
            formData['resp-email'] = document.getElementById('resp-email').value;
            formData['resp-cep'] = document.getElementById('resp-cep-input').value;
            formData['resp-logradouro'] = document.getElementById('resp-logradouro').value;
            formData['resp-numero'] = document.getElementById('resp-numero').value;
            formData['resp-complemento'] = document.getElementById('resp-complemento').value;
            formData['resp-bairro'] = document.getElementById('resp-bairro').value;
            formData['resp-localidade'] = document.getElementById('resp-localidade').value;
            formData['resp-uf'] = document.getElementById('resp-uf').value;
            formData['resp-sexo'] = document.querySelector('input[name="resp-sexo"]:checked')?.value || '';
            formData['resp-raca'] = document.getElementById('resp-raca').value;
        }

        try {
            const response = await fetch(backendUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                alert('Cadastro realizado com sucesso!');
                form.reset();
                form.classList.remove('was-validated');
                toggleResponsavelFields();

                // Define mainAddressFields aqui para garantir que esteja no escopo
                const mainAddressFields = {
                    logradouro: mainFields.logradouro,
                    numero: mainFields.numero,
                    complemento: mainFields.complemento,
                    bairro: mainFields.bairro,
                    localidade: mainFields.localidade,
                    uf: mainFields.uf
                };
                setAddressFieldsState(mainAddressFields, '', true, true); // Garante que estejam desabilitados e vazios após reset

                setTimeout(() => {
                    window.location.href = 'https://www.rn.senac.br/';
                }, 1500);

            } else {
                const errorData = await response.json(); // Tenta ler a resposta JSON para obter a mensagem de erro
                alert('Erro ao enviar o formulário: ' + (errorData.message || 'Erro desconhecido do servidor.'));
            }
        } catch (error) {
            console.error('Erro na requisição ou processamento:', error);
            if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
                alert('Erro de conexão com o servidor. Verifique sua internet ou se o backend está rodando.');
            } else {
                alert('Ocorreu um erro inesperado ao enviar o formulário. Por favor, tente novamente.');
            }
        }
    });

    // Chamadas iniciais para garantir o estado correto dos campos ao carregar a página
    // Mapeia os campos de endereço do solicitante principal para a função de controle de estado
    const mainAddressFieldsInitial = {
        logradouro: mainFields.logradouro,
        numero: mainFields.numero,
        complemento: mainFields.complemento,
        bairro: mainFields.bairro,
        localidade: mainFields.localidade,
        uf: mainFields.uf
    };
    // Desabilita os campos de endereço do solicitante principal ao carregar a página
    setAddressFieldsState(mainAddressFieldsInitial, '', true, true);

    toggleResponsavelFields(); // Esta chamada já cuida dos campos do responsável
});