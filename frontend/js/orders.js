// Orders API and Real-Time Polling Tracking

const API_BASE = 'http://localhost:8000';

async function pollOrderStatus(orderId) {
    const token = localStorage.getItem('dolcevita_token');
    if (!token) return;

    const trackerProgress = document.getElementById('tracker-progress-bar');
    const nodePendente = document.getElementById('node-pendente');
    const nodeProcessando = document.getElementById('node-processando');
    const nodeFinal = document.getElementById('node-final');
    const nodeFinalIcon = document.getElementById('node-final-icon');
    const nodeFinalLabel = document.getElementById('node-final-label');
    const statusMsg = document.getElementById('order-status-msg');

    let initialFetch = true;

    const interval = setInterval(async () => {
        try {
            const res = await fetch(`${API_BASE}/orders/${orderId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) {
                console.error("Order not found or unauthorized");
                statusMsg.innerText = "Erro ao buscar informações do pedido.";
                clearInterval(interval);
                return;
            }

            const order = await res.json();
            
            // Populate Receipt Card Details on first load
            if (initialFetch) {
                document.getElementById('det-customer').innerText = order.customer_name || 'Cliente';
                document.getElementById('det-delivery-type').innerText = order.delivery_type || 'ENTREGA';
                document.getElementById('det-total').innerText = `R$ ${order.total.toFixed(2)}`;
                document.getElementById('det-notes').innerText = order.notes || 'Nenhuma';
                
                // Render items
                const itemsList = document.getElementById('det-items-list');
                if (itemsList && order.items) {
                    itemsList.innerHTML = order.items.map(item => `
                        <div class="stage-line">
                            <span style="font-weight: 500; color: var(--blue-normal);">${item.quantity}x ${item.product}</span>
                            <span style="font-weight: 600; color: var(--red-darker);">R$ ${(item.quantity * item.unit_price).toFixed(2)}</span>
                        </div>
                    `).join('');
                }
                initialFetch = false;
            }

            // Update UI Pipeline based on order status
            if (order.status === 'PENDENTE') {
                if (trackerProgress) trackerProgress.style.width = '50%';
                if (nodePendente) nodePendente.className = "status-node completed";
                if (nodeProcessando) nodeProcessando.className = "status-node active";
                if (statusMsg) statusMsg.innerText = "Processando pagamento...";
            } 
            else if (order.status === 'APROVADO') {
                if (trackerProgress) trackerProgress.style.width = '100%';
                if (nodePendente) nodePendente.className = "status-node completed";
                if (nodeProcessando) nodeProcessando.className = "status-node completed";
                if (nodeFinal) nodeFinal.className = "status-node completed";
                if (nodeFinalIcon) nodeFinalIcon.innerHTML = `<svg class="icon-svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
                if (nodeFinalLabel) nodeFinalLabel.innerText = "Aprovado";
                
                if (statusMsg) {
                    statusMsg.innerText = "Pedido Aprovado! Sua DolceVita está sendo preparada.";
                    statusMsg.style.color = "#2E7D32";
                }
                
                clearInterval(interval);
            } 
            else if (order.status === 'REJEITADO') {
                if (trackerProgress) trackerProgress.style.width = '100%';
                if (nodePendente) nodePendente.className = "status-node completed";
                if (nodeProcessando) nodeProcessando.className = "status-node completed";
                if (nodeFinal) {
                    nodeFinal.className = "status-node active";
                    nodeFinal.style.borderColor = "var(--red-normal)";
                }
                if (nodeFinalIcon) {
                    nodeFinalIcon.innerHTML = `<svg class="icon-svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
                    nodeFinalIcon.style.color = "var(--red-normal)";
                }
                if (nodeFinalLabel) {
                    nodeFinalLabel.innerText = "Rejeitado";
                    nodeFinalLabel.style.color = "var(--red-normal)";
                }
                
                if (statusMsg) {
                    statusMsg.innerHTML = `<svg class="icon-svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 6px;"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> Pagamento Rejeitado. Tente novamente.`;
                    statusMsg.style.color = "#C62828";
                }
                
                clearInterval(interval);
            }
        } catch (e) {
            console.error("Polling error:", e);
        }
    }, 2000);
}
