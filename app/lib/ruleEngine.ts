export interface RuleFeature {
  name: string;
  condition: string;
  penalty_score: number;
  description: string;
}

export interface KnowledgeBase {
  knowledge_base: string;
  evaluation_method: string;
  base_score: number;
  features: RuleFeature[];
}

export interface EvaluationResult {
  scoreModifier: number;
  tags: string[];
}

export function evaluateKnowledgeBase(context: Record<string, any>, knowledgeBase: KnowledgeBase): EvaluationResult {
  let scoreModifier = 0;
  const tags: string[] = [];

  for (const feature of knowledgeBase.features) {
    if (evaluateCondition(feature.condition, context)) {
      scoreModifier += feature.penalty_score;
      tags.push(`⚠️ [${feature.name}]: ${feature.description} (${feature.penalty_score}点)`);
    }
  }

  return { scoreModifier, tags };
}

function evaluateCondition(condition: string, context: Record<string, any>): boolean {
  // AND 条件で分割
  const subConditions = condition.split(' AND ').map(s => s.trim());
  for (const sub of subConditions) {
    if (!evaluateSingleCondition(sub, context)) return false;
  }
  return true;
}

function evaluateSingleCondition(cond: string, context: Record<string, any>): boolean {
  // 1. IN
  let match = cond.match(/^([\w_]+)\s+IN\s+\((.*)\)$/);
  if (match) {
    const key = match[1];
    const values = match[2].split(',').map(v => v.trim().replace(/['"]/g, ''));
    return values.includes(String(context[key]));
  }

  // 2. NOT IN
  match = cond.match(/^([\w_]+)\s+NOT IN\s+\((.*)\)$/);
  if (match) {
    const key = match[1];
    const values = match[2].split(',').map(v => v.trim().replace(/['"]/g, ''));
    return !values.includes(String(context[key]));
  }

  // 3. Operators (>=, <=, ==, !=)
  match = cond.match(/^([\w_]+)\s*(>=|<=|==|!=)\s*(.*)$/);
  if (match) {
    const key = match[1];
    const operator = match[2];
    let rightValue: any = match[3].trim();
    let leftValue: any = context[key];
    
    if (rightValue === 'true') rightValue = true;
    else if (rightValue === 'false') rightValue = false;
    else if (!isNaN(Number(rightValue))) rightValue = Number(rightValue);
    else rightValue = rightValue.replace(/['"]/g, '');

    // 値が存在しない場合は基本的に条件を満たさない（未定義のものを比較させない）
    if (leftValue === undefined || leftValue === null) {
      // boolean の true 判定等でなければ false とする
      if (operator === '!=') return true; // undefined != 7 is true
      return false;
    }

    if (operator === '>=') return leftValue >= rightValue;
    if (operator === '<=') return leftValue <= rightValue;
    if (operator === '==') return String(leftValue) == String(rightValue);
    if (operator === '!=') return String(leftValue) != String(rightValue);
  }
  
  return false;
}
