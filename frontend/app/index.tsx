import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList, SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput, TouchableOpacity,
  View
} from 'react-native';

const API = 'http://localhost:3000';

type MenuItem = {
  id: number;
  name: string;
  price: number;
  category: string;
  emoji: string;
};

type CartItem = MenuItem & { quantity: number };

type Message = {
  role: 'user' | 'assistant';
  text: string;
};

export default function App() {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<'menu' | 'chat' | 'cart'>('menu');

  useEffect(() => {
    fetch(`${API}/menu`)
      .then(r => r.json())
      .then(setMenu);
  }, []);

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(c => c.id === item.id);
      if (existing) {
        return prev.map(c => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: number) => {
    setCart(prev => {
      const existing = prev.find(c => c.id === itemId);
      if (existing && existing.quantity > 1) {
        return prev.map(c => c.id === itemId ? { ...c, quantity: c.quantity - 1 } : c);
      }
      return prev.filter(c => c.id !== itemId);
    });
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch(`${API}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, cart })
      });
      const data = await res.json();

      if (data.actions) {
        data.actions.forEach((action: any) => {
          const item = menu.find(m => m.id === action.itemId);
          if (!item) return;
          if (action.type === 'add') {
            for (let i = 0; i < action.quantity; i++) addToCart(item);
          } else if (action.type === 'remove') {
            for (let i = 0; i < action.quantity; i++) removeFromCart(item.id);
          }
        });
      }

      setMessages(prev => [...prev, { role: 'assistant', text: data.message }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Sorry, something went wrong.' }]);
    }
    setLoading(false);
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🍽️ The Intelligent Bistro</Text>
        <View style={styles.cartBadge}>
          <Text style={styles.cartBadgeText}>{cart.reduce((s, i) => s + i.quantity, 0)}</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {(['menu', 'chat', 'cart'] as const).map(t => (
          <TouchableOpacity key={t} style={[styles.tab, tab === t && styles.activeTab]} onPress={() => setTab(t)}>
            <Text style={[styles.tabText, tab === t && styles.activeTabText]}>
              {t === 'menu' ? '🍕 Menu' : t === 'chat' ? '💬 AI Chat' : '🛒 Cart'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Menu Tab */}
      {tab === 'menu' && (
        <FlatList
          data={menu}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.menuCard}>
              <Text style={styles.menuEmoji}>{item.emoji}</Text>
              <View style={styles.menuInfo}>
                <Text style={styles.menuName}>{item.name}</Text>
                <Text style={styles.menuCategory}>{item.category}</Text>
                <Text style={styles.menuPrice}>${item.price.toFixed(2)}</Text>
              </View>
              <TouchableOpacity style={styles.addBtn} onPress={() => addToCart(item)}>
                <Text style={styles.addBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      {/* Chat Tab */}
      {tab === 'chat' && (
        <View style={styles.chatContainer}>
          <ScrollView style={styles.messages} contentContainerStyle={{ padding: 16 }}>
            {messages.length === 0 && (
              <Text style={styles.placeholder}>Say something like "Add two pizzas and a coke"</Text>
            )}
            {messages.map((msg, i) => (
              <View key={i} style={[styles.bubble, msg.role === 'user' ? styles.userBubble : styles.aiBubble]}>
                <Text style={[styles.bubbleText, msg.role === 'user' && styles.userBubbleText]}>{msg.text}</Text>
              </View>
            ))}
            {loading && <ActivityIndicator color="#6C63FF" style={{ marginTop: 8 }} />}
          </ScrollView>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={input}
              onChangeText={setInput}
              placeholder="Tell me what you'd like..."
              onSubmitEditing={sendMessage}
            />
            <TouchableOpacity style={styles.sendBtn} onPress={sendMessage} disabled={loading}>
              <Text style={styles.sendBtnText}>Send</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Cart Tab */}
      {tab === 'cart' && (
        <View style={styles.cartContainer}>
          <ScrollView contentContainerStyle={{ padding: 16 }}>
            {cart.length === 0 ? (
              <Text style={styles.placeholder}>Your cart is empty</Text>
            ) : (
              cart.map(item => (
                <View key={item.id} style={styles.cartCard}>
                  <Text style={styles.cartEmoji}>{item.emoji}</Text>
                  <View style={styles.cartInfo}>
                    <Text style={styles.cartName}>{item.name}</Text>
                    <Text style={styles.cartPrice}>${(item.price * item.quantity).toFixed(2)}</Text>
                  </View>
                  <View style={styles.qtyRow}>
                    <TouchableOpacity style={styles.qtyBtn} onPress={() => removeFromCart(item.id)}>
                      <Text style={styles.qtyBtnText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.qty}>{item.quantity}</Text>
                    <TouchableOpacity style={styles.qtyBtn} onPress={() => addToCart(item)}>
                      <Text style={styles.qtyBtnText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
          {cart.length > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalText}>Total: ${total.toFixed(2)}</Text>
              <TouchableOpacity style={styles.orderBtn}>
                <Text style={styles.orderBtnText}>Place Order</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { backgroundColor: '#6C63FF', padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  cartBadge: { backgroundColor: 'white', borderRadius: 12, width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  cartBadgeText: { color: '#6C63FF', fontWeight: 'bold', fontSize: 12 },
  tabs: { flexDirection: 'row', backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#EEE' },
  tab: { flex: 1, padding: 12, alignItems: 'center' },
  activeTab: { borderBottomWidth: 2, borderBottomColor: '#6C63FF' },
  tabText: { color: '#999', fontSize: 13 },
  activeTabText: { color: '#6C63FF', fontWeight: 'bold' },
  list: { padding: 16, gap: 12 },
  menuCard: { backgroundColor: 'white', borderRadius: 12, padding: 16, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  menuEmoji: { fontSize: 36, marginRight: 12 },
  menuInfo: { flex: 1 },
  menuName: { fontSize: 15, fontWeight: '600', color: '#1A1A2E' },
  menuCategory: { fontSize: 12, color: '#999', marginTop: 2 },
  menuPrice: { fontSize: 14, color: '#6C63FF', fontWeight: 'bold', marginTop: 4 },
  addBtn: { backgroundColor: '#6C63FF', borderRadius: 20, width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  addBtnText: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  chatContainer: { flex: 1 },
  messages: { flex: 1 },
  placeholder: { textAlign: 'center', color: '#999', marginTop: 40, fontSize: 14 },
  bubble: { padding: 12, borderRadius: 16, marginBottom: 8, maxWidth: '80%' },
  userBubble: { backgroundColor: '#6C63FF', alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  aiBubble: { backgroundColor: 'white', alignSelf: 'flex-start', borderBottomLeftRadius: 4, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4 },
  bubbleText: { fontSize: 14, color: '#333', lineHeight: 20 },
  userBubbleText: { color: 'white' },
  inputRow: { flexDirection: 'row', padding: 12, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#EEE', gap: 8 },
  input: { flex: 1, backgroundColor: '#F8F9FA', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14 },
  sendBtn: { backgroundColor: '#6C63FF', borderRadius: 20, paddingHorizontal: 20, justifyContent: 'center' },
  sendBtnText: { color: 'white', fontWeight: 'bold' },
  cartContainer: { flex: 1 },
  cartCard: { backgroundColor: 'white', borderRadius: 12, padding: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4 },
  cartEmoji: { fontSize: 32, marginRight: 12 },
  cartInfo: { flex: 1 },
  cartName: { fontSize: 15, fontWeight: '600', color: '#1A1A2E' },
  cartPrice: { fontSize: 14, color: '#6C63FF', fontWeight: 'bold', marginTop: 4 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  qtyBtn: { backgroundColor: '#F0EEFF', borderRadius: 16, width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  qtyBtnText: { color: '#6C63FF', fontSize: 16, fontWeight: 'bold' },
  qty: { fontSize: 16, fontWeight: 'bold', color: '#1A1A2E', minWidth: 20, textAlign: 'center' },
  totalRow: { padding: 16, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#EEE', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  totalText: { fontSize: 18, fontWeight: 'bold', color: '#1A1A2E' },
  orderBtn: { backgroundColor: '#6C63FF', borderRadius: 20, paddingHorizontal: 24, paddingVertical: 12 },
  orderBtnText: { color: 'white', fontWeight: 'bold', fontSize: 15 },
});