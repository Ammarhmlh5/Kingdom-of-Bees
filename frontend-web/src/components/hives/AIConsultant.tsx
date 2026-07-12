import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
    Sparkles,
    Send,
    Loader2,
    MessageCircle,
    Lightbulb,
    AlertCircle
} from 'lucide-react';

interface AIConsultantProps {
    context?: {
        hiveId?: string;
        hiveNumber?: string;
        condition?: string;
        lastInspection?: string;
        issues?: string[];
    };
    onRecommendation?: (recommendation: string) => void;
}

interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

export function AIConsultant({ context, onRecommendation }: AIConsultantProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    // Simulated AI responses - في الإنتاج، سيتم استبدال هذا بـ API حقيقي
    const getAIResponse = async (question: string): Promise<string> => {
        // محاكاة تأخير API
        await new Promise(resolve => setTimeout(resolve, 1500));

        // ردود ذكية بناءً على السياق والسؤال
        const lowerQuestion = question.toLowerCase();

        // أسئلة عن الملكة
        if (lowerQuestion.includes('ملكة') || lowerQuestion.includes('queen')) {
            if (context?.condition === 'WEAK') {
                return 'بناءً على حالة الخلية الضعيفة، أنصح بفحص الملكة بعناية. تحقق من:\n\n1. وجود بيض منتظم (نمط جيد)\n2. عمر الملكة - إذا كانت أكبر من 3 سنوات، فكر في الاستبدال\n3. وجود بيوت ملكية طارئة (علامة على مشكلة)\n4. نشاط الملكة وحركتها\n\nإذا كانت الملكة ضعيفة أو غير موجودة، استبدلها في أقرب وقت ممكن.';
            }
            return 'للحفاظ على ملكة قوية:\n\n1. راقب نمط وضع البيض بانتظام\n2. استبدل الملكات كل 2-3 سنوات\n3. تأكد من وجود حبوب لقاح كافية\n4. تجنب الإزعاج المفرط للخلية\n5. راقب علامات التطريد';
        }

        // أسئلة عن الأمراض
        if (lowerQuestion.includes('مرض') || lowerQuestion.includes('disease') || lowerQuestion.includes('علاج')) {
            return 'للوقاية من الأمراض والعلاج:\n\n**الوقاية:**\n- نظافة الأدوات بين الخلايا\n- تهوية جيدة\n- تغذية متوازنة\n- فحص دوري\n\n**العلاج:**\n- حدد المرض بدقة أولاً\n- استخدم العلاج المناسب\n- اعزل الخلايا المصابة\n- راقب التحسن\n\nإذا لاحظت أعراض غير عادية، استشر خبير نحل محلي.';
        }

        // أسئلة عن التقسيم
        if (lowerQuestion.includes('تقسيم') || lowerQuestion.includes('split')) {
            return 'أفضل وقت للتقسيم:\n\n**الشروط المثالية:**\n- خلية قوية (10+ إطارات حضنة)\n- موسم فيض قادم\n- ملكة شابة ونشطة\n- طقس دافئ ومستقر\n\n**خطوات التقسيم:**\n1. انقل 4-5 إطارات حضنة مع النحل\n2. أضف إطار عسل وحبوب لقاح\n3. ضع الملكة أو بيت ملكي\n4. راقب بعد 3 أيام\n5. تأكد من قبول الملكة بعد أسبوع';
        }

        // أسئلة عن الدمج
        if (lowerQuestion.includes('دمج') || lowerQuestion.includes('merge')) {
            return 'دمج الخلايا الضعيفة:\n\n**متى تدمج:**\n- خلية ضعيفة قبل الشتاء\n- ملكة فاشلة\n- خلية يتيمة\n\n**طريقة الجريدة (الأفضل):**\n1. ضع ورق جريدة مثقوب بين الصندوقين\n2. رش بماء السكر\n3. النحل سيأكل الورق تدريجياً\n4. يختلط النحل بأمان\n\n**تحذير:** احذف الملكة الضعيفة قبل الدمج!';
        }

        // أسئلة عن العاسلات
        if (lowerQuestion.includes('عاسلة') || lowerQuestion.includes('super') || lowerQuestion.includes('إنتاج')) {
            return 'إضافة العاسلات للإنتاج الأمثل:\n\n**التوقيت:**\n- عندما تملأ النحل 8-9 إطارات\n- قبل موسم الفيض بأسبوعين\n- في الطقس الدافئ\n\n**النصائح:**\n1. استخدم حاجز ملكات\n2. ضع إطارات مبنية في العاسلة\n3. راقب الامتلاء\n4. أضف عاسلة ثانية عند الحاجة\n5. اقطف العسل عند النضج (75%+ مختوم)';
        }

        // أسئلة عن التغذية
        if (lowerQuestion.includes('تغذية') || lowerQuestion.includes('غذاء') || lowerQuestion.includes('feed')) {
            return 'التغذية الصحيحة:\n\n**متى تغذي:**\n- قبل الشتاء (بناء مخزون)\n- بعد الشتاء (تحفيز)\n- في فترات الجفاف\n- بعد القطف\n\n**أنواع الغذاء:**\n- محلول سكر 1:1 (تحفيز)\n- محلول سكر 2:1 (تخزين)\n- عجينة حبوب لقاح\n- كاندي (شتاء)\n\n**تحذير:** لا تغذي أثناء وجود عاسلات!';
        }

        // رد افتراضي
        return `شكراً على سؤالك! ${context?.hiveNumber ? `بخصوص الخلية #${context.hiveNumber}` : ''}\n\nأنا هنا لمساعدتك في:\n\n• تشخيص مشاكل الخلايا\n• توصيات الفحص والصيانة\n• نصائح التقسيم والدمج\n• إدارة الإنتاج والعاسلات\n• الوقاية من الأمراض\n• التغذية الصحيحة\n\nيمكنك سؤالي عن أي موضوع يتعلق بتربية النحل!`;
    };

    const handleSend = async () => {
        if (!input.trim()) {
            toast.error('يرجى كتابة سؤال');
            return;
        }

        const userMessage: Message = {
            role: 'user',
            content: input,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const response = await getAIResponse(input);
            
            const assistantMessage: Message = {
                role: 'assistant',
                content: response,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, assistantMessage]);

            if (onRecommendation) {
                onRecommendation(response);
            }
        } catch (error) {
            console.error('AI consultation error:', error);
            toast.error('فشل الحصول على استشارة');
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // أسئلة سريعة مقترحة
    const quickQuestions = [
        'كيف أعرف إذا كانت الملكة جيدة؟',
        'متى أقسم الخلية؟',
        'كيف أدمج خليتين؟',
        'متى أضيف عاسلة؟',
        'كيف أعالج الأمراض؟'
    ];

    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-2 rounded-lg">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <CardTitle className="text-lg">مستشار الذكاء الاصطناعي</CardTitle>
                            <p className="text-xs text-gray-500 mt-0.5">اسأل عن أي شيء يتعلق بتربية النحل</p>
                        </div>
                    </div>
                    <Badge variant="outline" className="bg-purple-50 border-purple-200 text-purple-700">
                        <Lightbulb className="w-3 h-3 ml-1" />
                        Beta
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col space-y-4">
                {/* Context Info */}
                {context && context.hiveNumber && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                        <div className="flex items-center gap-2 text-blue-900">
                            <AlertCircle className="w-4 h-4" />
                            <span className="font-semibold">السياق: خلية #{context.hiveNumber}</span>
                        </div>
                        {context.condition && (
                            <p className="text-blue-700 text-xs mt-1">الحالة: {context.condition}</p>
                        )}
                    </div>
                )}

                {/* Messages */}
                <div className="flex-1 space-y-3 overflow-y-auto max-h-96 min-h-[200px]">
                    {messages.length === 0 ? (
                        <div className="text-center py-8">
                            <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 font-medium mb-2">مرحباً! كيف يمكنني مساعدتك؟</p>
                            <p className="text-sm text-gray-400">اسأل عن أي شيء يتعلق بإدارة خلايا النحل</p>
                        </div>
                    ) : (
                        messages.map((message, index) => (
                            <div
                                key={index}
                                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] rounded-lg p-3 ${
                                        message.role === 'user'
                                            ? 'bg-purple-600 text-white'
                                            : 'bg-gray-100 text-gray-900'
                                    }`}
                                >
                                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                    <p className={`text-xs mt-1 ${
                                        message.role === 'user' ? 'text-purple-200' : 'text-gray-500'
                                    }`}>
                                        {message.timestamp.toLocaleTimeString('ar-SA', { 
                                            hour: '2-digit', 
                                            minute: '2-digit' 
                                        })}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}

                    {loading && (
                        <div className="flex justify-start">
                            <div className="bg-gray-100 rounded-lg p-3">
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span className="text-sm">جاري التفكير...</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Quick Questions */}
                {messages.length === 0 && (
                    <div className="space-y-2">
                        <p className="text-xs text-gray-600 font-semibold">أسئلة سريعة:</p>
                        <div className="flex flex-wrap gap-2">
                            {quickQuestions.map((question, index) => (
                                <Button
                                    key={index}
                                    variant="outline"
                                    size="sm"
                                    className="text-xs"
                                    onClick={() => setInput(question)}
                                >
                                    {question}
                                </Button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Input */}
                <div className="flex gap-2">
                    <Textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="اكتب سؤالك هنا... (اضغط Enter للإرسال)"
                        className="resize-none"
                        rows={2}
                        disabled={loading}
                    />
                    <Button
                        onClick={handleSend}
                        disabled={loading || !input.trim()}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                        {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Send className="w-4 h-4" />
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
