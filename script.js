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
    // Atualizado para incluir os novos campos de endereço do responsável
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
        document.getElementById('resp-raca'), // Adicionado resp-raca
        ...document.querySelectorAll('input[name="resp-sexo"]')
    ];


    // --- Funções de Validação (Mantidas) ---

    /**
     * Valida um número de CPF.
     * @param {string} cpf O CPF a ser validado.
     * @returns {boolean} True se o CPF for válido, False caso contrário.
     */
    function validateCPF(cpf) {
        if (!cpf) return false;
        cpf = cpf.replace(/[^\d]+/g, ''); // Remove caracteres não numéricos

        // Verifica se tem 11 dígitos e se não são todos iguais (ex: 111.111.111-11)
        if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

        let sum = 0;
        let remainder;

        // Valida o primeiro dígito verificador
        for (let i = 1; i <= 9; i++) {
            sum = sum + parseInt(cpf.substring(i - 1, i)) * (11 - i);
        }
        remainder = (sum * 10) % 11;
        if ((remainder === 10) || (remainder === 11)) remainder = 0;
        if (remainder !== parseInt(cpf.substring(9, 10))) return false;

        sum = 0;
        // Valida o segundo dígito verificador
        for (let i = 1; i <= 10; i++) {
            sum = sum + parseInt(cpf.substring(i - 1, i)) * (12 - i);
        }
        remainder = (sum * 10) % 11;
        if ((remainder === 10) || (remainder === 11)) remainder = 0;
        if (remainder !== parseInt(cpf.substring(10, 11))) return false;

        return true;
    }

    /**
     * Valida um endereço de e-mail usando uma expressão regular.
     * @param {string} email O e-mail a ser validado.
     * @returns {boolean} True se o e-mail for válido, False caso contrário.
     */
    function validateEmail(email) {
        if (!email) return false;
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    }

    /**
     * Valida um número de telefone (básico: apenas números, mínimo 10-11 dígitos).
     * @param {string} phone O telefone a ser validado.
     * @returns {boolean} True se o telefone for válido, False caso contrário.
     */
    function validatePhone(phone) {
        if (!phone) return false;
        const cleanedPhone = phone.replace(/[^\d]+/g, '');
        return cleanedPhone.length >= 11 && cleanedPhone.length <= 12;
    }

    // --- Funções de Ajuda para Validação de UI (Bootstrap) (Mantidas) ---

    /**
     * Adiciona ou remove as classes de validação do Bootstrap em um elemento de input.
     * @param {HTMLElement} inputElement O elemento de input a ser manipulado.
     * @param {boolean} isValid True para marcar como válido, False para marcar como inválido.
     */
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

    /**
     * Valida um campo individual usando uma função de validação específica e atualiza o estado visual do Bootstrap.
     * @param {HTMLElement} inputElement O elemento de input a ser validado.
     * @param {Function} validatorFunction A função de validação a ser utilizada (ex: validateCPF).
     * @returns {boolean} True se o campo for válido, False caso contrário.
     */
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

    // --- Lógica de Idade e Campos do Responsável (Mantidas) ---

    /**
     * Calcula a idade com base na data de nascimento.
     * @param {string} dataNasc A data de nascimento no formato 'YYYY-MM-DD'.
     * @returns {number} A idade calculada.
     */
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

    /**
     * Alterna a visibilidade e a obrigatoriedade dos campos do responsável legal.
     * Atualizado para incluir os novos campos de endereço.
     */
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
                if (field && !field.readOnly) { // Não altera 'required' de campos readOnly
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
                    if (field.type !== 'radio' && !field.readOnly) { // Não limpa campos readOnly
                        field.value = '';
                    } else if (field.type === 'radio') {
                        field.checked = false;
                    }
                    field.classList.remove('is-valid', 'is-invalid');
                }
            });
            // Limpa campos readOnly do responsável e os desabilita
            document.getElementById('resp-logradouro').value = '';
            document.getElementById('resp-logradouro').disabled = true;
            document.getElementById('resp-bairro').value = '';
            document.getElementById('resp-bairro').disabled = true;
            document.getElementById('resp-localidade').value = '';
            document.getElementById('resp-localidade').disabled = true;
            document.getElementById('resp-uf').value = '';
            document.getElementById('resp-uf').disabled = true;
            document.getElementById('resp-numero').value = '';
            document.getElementById('resp-numero').disabled = true;
            document.getElementById('resp-complemento').value = '';
            document.getElementById('resp-complemento').disabled = true;
            document.getElementById('resp-cep-input').value = ''; // Limpa o CEP para nova busca


            const respSexoRadios = document.querySelectorAll('input[name="resp-sexo"]');
            if (respSexoRadios.length > 0) {
                respSexoRadios[0].removeAttribute('required');
                respSexoRadios.forEach(radio => {
                    radio.checked = false;
                    radio.classList.remove('is-valid', 'is-invalid');
                });
            }
            const respRacaSelect = document.getElementById('resp-raca');
            if (respRacaSelect) {
                respRacaSelect.removeAttribute('required');
                respRacaSelect.value = ''; // Limpa a seleção
                respRacaSelect.classList.remove('is-valid', 'is-invalid');
            }
        }
    }

    // --- Função Auxiliar para formatar data de nascimento para a API (Mantida) ---
    function formatBirthDateForApi(dateString) {
        if (!dateString) return '';
        const [year, month, day] = dateString.split('-'); // data de input[type="date"] é YYYY-MM-DD
        return `${day}/${month}/${year}`; // Formata para DD/MM/YYYY
    }

    // --- NOVAS FUNÇÕES: PREENCHIMENTO DE ENDEREÇO POR CEP ---

    /**
     * Limpa os campos de endereço preenchidos automaticamente e os habilita.
     * @param {Object} fields Objeto contendo referências aos campos de endereço (logradouro, bairro, localidade, uf, numero, complemento).
     */
    function clearAndEnableAddressFields(fields) {
        if (fields.logradouro) { fields.logradouro.value = ''; fields.logradouro.disabled = false; }
        if (fields.bairro) { fields.bairro.value = ''; fields.bairro.disabled = false; }
        if (fields.localidade) { fields.localidade.value = ''; fields.localidade.disabled = false; }
        if (fields.uf) { fields.uf.value = ''; fields.uf.disabled = false; }
        if (fields.numero) { fields.numero.value = ''; fields.numero.disabled = false; } // Número sempre manual, mas limpa
        if (fields.complemento) { fields.complemento.value = ''; fields.complemento.disabled = false; } // Complemento sempre manual, mas limpa
    }

    /**
     * Preenche os campos de endereço com os dados da API ViaCEP e os desabilita.
     * @param {Object} fields Objeto contendo referências aos campos de endereço.
     * @param {Object} data Dados de endereço retornados pela ViaCEP.
     */
    function fillAndDisableAddressFields(fields, data) {
        if (fields.logradouro) { fields.logradouro.value = data.logradouro || ''; fields.logradouro.disabled = true; }
        if (fields.bairro) { fields.bairro.value = data.bairro || ''; fields.bairro.disabled = true; }
        if (fields.localidade) { fields.localidade.value = data.localidade || ''; fields.localidade.disabled = true; }
        if (fields.uf) { fields.uf.value = data.uf || ''; fields.uf.disabled = true; }
        // Número e Complemento são sempre preenchidos manualmente, então não são desabilitados.
        // mas você pode pré-popular se a ViaCEP fornecer, e o usuário ainda pode editar
        if (data.complemento && fields.complemento) { // ViaCEP retorna 'complemento' (prédios, etc.)
            fields.complemento.value = data.complemento;
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
        clearAndEnableAddressFields(addressFields);

        if (cep.length !== 8) {
            setValidationState(cepInput, false);
            return;
        }

        try {
            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const data = await response.json();

            if (data.erro) {
                clearAndEnableAddressFields(addressFields); // Garante que estejam habilitados e vazios
                setValidationState(cepInput, false);
                alert('CEP não encontrado.');
            } else {
                fillAndDisableAddressFields(addressFields, data); // Preenche e desabilita os que devem ser automáticos
                setValidationState(cepInput, true);
                setValidationState(addressFields.logradouro, true);
                setValidationState(addressFields.bairro, true);
                setValidationState(addressFields.localidade, true);
                setValidationState(addressFields.uf, true);
            }
        } catch (error) {
            console.error('Erro ao buscar CEP:', error);
            clearAndEnableAddressFields(addressFields); // Garante que estejam habilitados e vazios
            setValidationState(cepInput, false);
            alert('Erro ao consultar o CEP. Tente novamente.');
        }
    }

    // --- Event Listeners para validação "ao digitar" ou "ao sair do campo" ---

    // Adiciona listeners para os campos que precisam de validação robusta
    // para o solicitante principal
    mainFields.cpf.addEventListener('blur', function () {
        validateAndSetState(this, validationMap.cpf);
        if (this.value && mainFields.nascimento.value) {
            // fetchCPFData(this.value, mainFields.nascimento.value, mainFields.name); // Descomente se tiver essa função
        } else if (!mainFields.nascimento.value) {
            console.warn("Data de nascimento principal é necessária para consultar o CPFHub.");
        } else {
            mainFields.name.value = '';
            setValidationState(mainFields.name, false);
        }
    });
    mainFields.nascimento.addEventListener('change', function () {
        if (mainFields.cpf.value) {
            // fetchCPFData(mainFields.cpf.value, this.value, mainFields.name); // Descomente se tiver essa função
        }
    });

    mainFields.email.addEventListener('input', function () {
        validateAndSetState(this, validationMap.email);
    });
    mainFields.telefone.addEventListener('input', function () {
        validateAndSetState(this, validationMap.telefone);
    });

    // Novo listener para o CEP do solicitante principal
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
        // Formata o CEP (opcional, para melhor UX)
        let value = this.value.replace(/\D/g, ''); // Remove tudo que não é dígito
        if (value.length > 5) {
            value = value.substring(0, 5) + '-' + value.substring(5, 8);
        }
        this.value = value;
        // Limpa estados de validação enquanto o usuário digita
        this.classList.remove('is-valid', 'is-invalid');
        // Garante que campos preenchidos automaticamente sejam habilitados e limpos ao digitar novo CEP
        clearAndEnableAddressFields({
            logradouro: mainFields.logradouro,
            numero: mainFields.numero,
            complemento: mainFields.complemento,
            bairro: mainFields.bairro,
            localidade: mainFields.localidade,
            uf: mainFields.uf
        });
        setValidationState(mainFields.logradouro, true); // Assume que está vazio e válido para evitar feedback negativo inicial
        setValidationState(mainFields.bairro, true);
        setValidationState(mainFields.localidade, true);
        setValidationState(mainFields.uf, true);
    });


    // Adiciona listeners para os campos que precisam de validação robusta
    // para o responsável legal (mesmo quando a seção está oculta, os listeners devem existir)
    document.getElementById('resp-cpf').addEventListener('blur', function () {
        validateAndSetState(this, validationMap.cpf);
        const respNascimentoInput = document.getElementById('resp-nascimento');
        if (this.value && respNascimentoInput.value) {
            // fetchCPFData(this.value, respNascimentoInput.value, document.getElementById('resp-name')); // Descomente se tiver essa função
        } else if (!respNascimentoInput.value) {
             console.warn("Data de nascimento do responsável é necessária para consultar o CPFHub.");
        } else {
            document.getElementById('resp-name').value = '';
            setValidationState(document.getElementById('resp-name'), false);
        }
    });
    document.getElementById('resp-nascimento').addEventListener('change', function () {
        const respCpfInput = document.getElementById('resp-cpf');
        if (respCpfInput.value) {
            // fetchCPFData(respCpfInput.value, this.value, document.getElementById('resp-name')); // Descomente se tiver essa função
        }
    });

    document.getElementById('resp-email').addEventListener('input', function () {
        validateAndSetState(this, validationMap.email);
    });
    document.getElementById('resp-telefone').addEventListener('input', function () {
        validateAndSetState(this, validationMap.telefone);
    });

    // Novo listener para o CEP do responsável legal
    const respCepInput = document.getElementById('resp-cep-input');
    const respAddressFields = {
        logradouro: document.getElementById('resp-logradouro'),
        numero: document.getElementById('resp-numero'),
        complemento: document.getElementById('resp-complemento'),
        bairro: document.getElementById('resp-bairro'),
        localidade: document.getElementById('resp-localidade'),
        uf: document.getElementById('resp-uf')
    };

    respCepInput.addEventListener('blur', function () {
        fetchAddressByCep(respCepInput, respAddressFields);
    });
    respCepInput.addEventListener('input', function() {
        let value = this.value.replace(/\D/g, ''); // Remove tudo que não é dígito
        if (value.length > 5) {
            value = value.substring(0, 5) + '-' + value.substring(5, 8);
        }
        this.value = value;
        this.classList.remove('is-valid', 'is-invalid');
        clearAndEnableAddressFields(respAddressFields);
        setValidationState(respAddressFields.logradouro, true);
        setValidationState(respAddressFields.bairro, true);
        setValidationState(respAddressFields.localidade, true);
        setValidationState(respAddressFields.uf, true);
    });


    // Listener para a data de nascimento do solicitante principal (para mostrar/esconder a seção do responsável)
    dataNascimentoInput.addEventListener('change', toggleResponsavelFields);

    // URL do seu endpoint de backend (atualizado para o servidor local com MongoDB)
    const backendUrl = 'http://localhost:3000/api/submit-form';


    // --- Validação no Submit do Formulário (Bootstrap + Validações Customizadas) ---

    form.addEventListener('submit', async function (event) { // Adicione 'async' aqui
        event.preventDefault(); // Impedir o envio padrão do formulário
        event.stopPropagation(); // Impedir a propagação do evento

        let formIsValid = true;

        // ** Sua lógica de validação existente do Bootstrap e customizada aqui **
        if (!form.checkValidity()) {
            formIsValid = false;
        }

        if (mainFields.cpf.hasAttribute('required') && !validateAndSetState(mainFields.cpf, validationMap.cpf)) {
            formIsValid = false;
        }
        if (mainFields.email.hasAttribute('required') && !validateAndSetState(mainFields.email, validationMap.email)) {
            formIsValid = false;
        }
        if (mainFields.telefone.hasAttribute('required') && !validateAndSetState(mainFields.telefone, validationMap.telefone)) {
            formIsValid = false;
        }

        // Validação dos novos campos de endereço do solicitante principal
        if (mainFields.cep.hasAttribute('required') && !mainFields.cep.value) {
            setValidationState(mainFields.cep, false);
            formIsValid = false;
        } else if (mainFields.cep.value.length === 9) { // Verifica se o CEP está formatado corretamente
             setValidationState(mainFields.cep, true);
        }

        if (mainFields.logradouro.hasAttribute('required') && !mainFields.logradouro.value) {
            setValidationState(mainFields.logradouro, false);
            formIsValid = false;
        }
        if (mainFields.numero.hasAttribute('required') && !mainFields.numero.value) {
            setValidationState(mainFields.numero, false);
            formIsValid = false;
        }
        if (mainFields.bairro.hasAttribute('required') && !mainFields.bairro.value) {
            setValidationState(mainFields.bairro, false);
            formIsValid = false;
        }
        if (mainFields.localidade.hasAttribute('required') && !mainFields.localidade.value) {
            setValidationState(mainFields.localidade, false);
            formIsValid = false;
        }
        if (mainFields.uf.hasAttribute('required') && !mainFields.uf.value) {
            setValidationState(mainFields.uf, false);
            formIsValid = false;
        }


        const sexoRadios = document.querySelectorAll('input[name="sexo"]');
        const isSexoChecked = Array.from(sexoRadios).some(radio => radio.checked);
        if (!isSexoChecked && sexoRadios.length > 0 && sexoRadios[0].hasAttribute('required')) {
            sexoRadios.forEach(radio => radio.classList.add('is-invalid'));
            formIsValid = false;
        } else {
            sexoRadios.forEach(radio => radio.classList.remove('is-invalid'));
        }
        const racaSelect = document.getElementById('raca');
        if (racaSelect.hasAttribute('required') && !racaSelect.value) {
            setValidationState(racaSelect, false);
            formIsValid = false;
        } else if (racaSelect.hasAttribute('required')) {
             setValidationState(racaSelect, true);
        }


        if (responsavelSection.style.display === 'block') {
            const respCpfInput = document.getElementById('resp-cpf');
            const respEmailInput = document.getElementById('resp-email');
            const respTelefoneInput = document.getElementById('resp-telefone');
            const respNascimentoInput = document.getElementById('resp-nascimento');

            if (respCpfInput.hasAttribute('required') && !validateAndSetState(respCpfInput, validationMap.cpf)) {
                formIsValid = false;
            }
            if (respNascimentoInput.hasAttribute('required') && !respNascimentoInput.value) {
                setValidationState(respNascimentoInput, false);
                formIsValid = false;
            } else if (respNascimentoInput.hasAttribute('required')) {
                 setValidationState(respNascimentoInput, true);
            }

            if (respEmailInput.hasAttribute('required') && !validateAndSetState(respEmailInput, validationMap.email)) {
                formIsValid = false;
            }
            if (respTelefoneInput.hasAttribute('required') && !validateAndSetState(respTelefoneInput, validationMap.telefone)) {
                formIsValid = false;
            }

            // Validação dos novos campos de endereço do responsável legal
            const respCepInput = document.getElementById('resp-cep-input');
            const respLogradouro = document.getElementById('resp-logradouro');
            const respNumero = document.getElementById('resp-numero');
            const respBairro = document.getElementById('resp-bairro');
            const respLocalidade = document.getElementById('resp-localidade');
            const respUf = document.getElementById('resp-uf');
            const respRacaSelect = document.getElementById('resp-raca');


            if (respCepInput.hasAttribute('required') && !respCepInput.value) {
                setValidationState(respCepInput, false);
                formIsValid = false;
            } else if (respCepInput.value.length === 9) {
                 setValidationState(respCepInput, true);
            }
            if (respLogradouro.hasAttribute('required') && !respLogradouro.value) {
                setValidationState(respLogradouro, false);
                formIsValid = false;
            }
            if (respNumero.hasAttribute('required') && !respNumero.value) {
                setValidationState(respNumero, false);
                formIsValid = false;
            }
            if (respBairro.hasAttribute('required') && !respBairro.value) {
                setValidationState(respBairro, false);
                formIsValid = false;
            }
            if (respLocalidade.hasAttribute('required') && !respLocalidade.value) {
                setValidationState(respLocalidade, false);
                formIsValid = false;
            }
            if (respUf.hasAttribute('required') && !respUf.value) {
                setValidationState(respUf, false);
                formIsValid = false;
            }

            const respSexoRadios = document.querySelectorAll('input[name="resp-sexo"]');
            const isRespSexoChecked = Array.from(respSexoRadios).some(radio => radio.checked);
            if (!isRespSexoChecked && respSexoRadios.length > 0 && respSexoRadios[0].hasAttribute('required')) {
                respSexoRadios.forEach(radio => radio.classList.add('is-invalid'));
                formIsValid = false;
            } else {
                 respSexoRadios.forEach(radio => radio.classList.remove('is-invalid'));
            }

            if (respRacaSelect.hasAttribute('required') && !respRacaSelect.value) {
                setValidationState(respRacaSelect, false);
                formIsValid = false;
            } else if (respRacaSelect.hasAttribute('required')) {
                 setValidationState(respRacaSelect, true);
            }
        }

        if (!formIsValid) {
            form.classList.add('was-validated');
            return; // Impede o envio
        }

        // Se o formulário é válido, colete os dados e envie para o backend
        form.classList.add('was-validated'); // Marca como validado para exibir estados visuais

        const formData = {
            cpf: mainFields.cpf.value,
            nascimento: mainFields.nascimento.value,
            rg: mainFields.rg.value,
            name: mainFields.name.value,
            telefone: mainFields.telefone.value,
            email: mainFields.email.value,
            // Dados de endereço do solicitante principal
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

        // Adicionar dados do responsável se a seção estiver visível
        if (responsavelSection.style.display === 'block') {
            formData['resp-name'] = document.getElementById('resp-name').value;
            formData['resp-nascimento'] = document.getElementById('resp-nascimento').value;
            formData['resp-rg'] = document.getElementById('resp-rg').value;
            formData['resp-cpf'] = document.getElementById('resp-cpf').value;
            formData['resp-telefone'] = document.getElementById('resp-telefone').value;
            formData['resp-email'] = document.getElementById('resp-email').value;
            // Dados de endereço do responsável legal
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
                const result = await response.json();
                alert(result.message);
                form.reset(); // Limpa o formulário
                form.classList.remove('was-validated'); // Remove a validação visual
                toggleResponsavelFields(); // Reseta a visibilidade da seção do responsável
            } else {
                const errorData = await response.json();
                alert('Erro ao enviar o formulário: ' + (errorData.message || 'Erro desconhecido.'));
            }
        } catch (error) {
            console.error('Erro na requisição para o backend:', error);
            alert('Erro de conexão ao enviar o formulário. Tente novamente.');
        }
    });

    // Inicia a função para garantir o estado correto dos campos ao carregar a página
    toggleResponsavelFields();
});
